/* eslint-disable @typescript-eslint/no-unsafe-return */
"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Client, type Frame, type Message } from "@stomp/stompjs";
import {
  MapContainer,
  TileLayer,
  Popup,
  useMapEvents,
  Marker,
  Polyline,
  useMap,
} from "react-leaflet";
import { MapPin, Bus as BusIcon } from "lucide-react";
import { divIcon } from "leaflet";
import { renderToString } from "react-dom/server";
import Cookies from "js-cookie";
import { baseUrlStock } from "~/APIs/axios";
import useLanguageStore, { useUserDataStore } from "~/APIs/store";
import Container from "~/_components/Container";
import "leaflet/dist/leaflet.css";

interface FormData {
  busId: string;
  longitude: number;
  latitude: number;
}

interface BusLocation {
  message?: string;
  busId: number;
  longitude: number;
  latitude: number;
}

interface NotificationData {
  id: number;
  title: string;
  description: string;
  timestamp: number;
}

interface RawBusData {
  message: string;
  data: {
    id: number;
    longitude: number;
    latitude: number;
  };
}

// Custom marker icon component
const createCustomMarkerIcon = (color: string) => {
  const iconHtml = renderToString(
    <div className="relative">
      <MapPin size={32} color={color} fill={color} fillOpacity={0.2} />
      <div className="absolute bottom-0 left-1/2 h-px w-px bg-transparent" />
    </div>,
  );

  return divIcon({
    html: iconHtml,
    className: "custom-marker",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

// Location marker component
const LocationMarker: React.FC<{
  onLocationSelect: (lat: number, lng: number) => void;
  position: [number, number] | null;
}> = ({ onLocationSelect, position }) => {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });

  return position ? (
    <Marker position={position} icon={createCustomMarkerIcon("#e84743")}>
      <Popup>Bus Location</Popup>
    </Marker>
  ) : null;
};

const Bus: React.FC = () => {
  const [myLocation, setMyLocation] = useState<[number, number] | null>(null);
  const [connected, setConnected] = useState<boolean>(false);
  const [messages, setMessages] = useState<BusLocation[]>([]);
  const [formData, setFormData] = useState<FormData>({
    busId: "",
    longitude: 0,
    latitude: 0,
  });
  const [stompClient, setStompClient] = useState<Client | null>(null);
  const [markerPosition, setMarkerPosition] = useState<[number, number] | null>(
    null,
  );
  // New state to hold the notification data (set once on connect)
  const [notification, setNotification] = useState<NotificationData | null>(
    null,
  );

  const token = Cookies.get("token");
  const userData = useUserDataStore.getState().userData;
  // const userId = userData.id;
  const userId = 8;
  const language = useLanguageStore((state) => state.language);

  // Map default position
  const defaultPosition: [number, number] = [29.261243, -9.873053];

  // get height of screen
  const [screenHeight, setScreenHeight] = useState<number>(window.innerHeight);
  useEffect(() => {
    const handleResize = () => setScreenHeight(window.innerHeight);
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);
  // Handle location selection on map
  const handleLocationSelect = (lat: number, lng: number) => {
    setMarkerPosition([lat, lng]);
    setFormData((prev) => ({
      ...prev,
      latitude: lat,
      longitude: lng,
    }));
  };
  // get my location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setMyLocation([position.coords.latitude, position.coords.longitude]);
          console.log(
            "My location:",
            position.coords.latitude,
            position.coords.longitude,
          );
        },
        (error) => {
          console.error("Error getting location:", error);
        },
      );
    }
  }, []);

  // Initialize WebSocket connection and subscriptions
  useEffect(() => {
    if (!userId || !token || !formData.busId) return;
    const client = new Client({
      brokerURL: `${baseUrlStock}ws?token=${token}`,
      debug: (str: string) => console.log(str),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = (frame: Frame) => {
      setConnected(true);
      console.log("Connected: " + JSON.stringify(frame));

      try {
        // Subscribe to bus location updates
        console.log(
          "🟡 Subscribing to topic:",
          `/topic/bus-location/${formData.busId}`,
        );

        client.subscribe(
          `/topic/bus-location/${formData.busId}`,
          (message: Message) => {
            console.log("👾 ~ useEffect ~ message:", message);
            const rawData: RawBusData = JSON.parse(message.body);
            const data: BusLocation = {
              message: rawData.message,
              busId: rawData.data.id,
              longitude: rawData.data.longitude,
              latitude: rawData.data.latitude,
            };
            addMessage(data);
          },
        );

        // Subscribe to user notifications
        client.subscribe(
          `/user/${userId}/notifications`,
          (message: Message) => {
            const rawData: NotificationData = JSON.parse(message.body);
            // Set the notification state only if it has not been set yet
            setNotification((current) => current || rawData);
            console.log("Notification received at:", rawData.timestamp);
          },
        );

        console.log("Subscribed successfully");
      } catch (error) {
        console.error("Error in subscriptions:", error);
      }
    };

    client.onWebSocketError = (error: Event) => {
      console.error("WebSocket error:", error);
    };

    client.onStompError = (frame: Frame) => {
      console.error("Broker error:", frame.headers.message, frame.body);
    };

    setStompClient(client);

    return () => {
      if (client.connected) {
        void client.deactivate();
      }
    };
  }, [userId, token, formData.busId]);

  // Distance between me and the bus
  const calculateDistanceKm = (
    [lat1, lon1]: [number, number],
    [lat2, lon2]: [number, number],
  ): number => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // auto zoom
  const AutoZoom = ({
    from,
    to,
  }: {
    from: [number, number];
    to: [number, number];
  }) => {
    const map = useMap();

    useEffect(() => {
      map.fitBounds([from, to], { padding: [50, 50] });
    }, [from, to, map]);

    return null;
  };

  // Connection handlers
  const connect = useCallback(() => {
    if (stompClient) {
      stompClient.activate();
    }
  }, [stompClient]);

  const disconnect = useCallback(() => {
    if (stompClient) {
      void stompClient.deactivate();
      setConnected(false);
      setMessages([]);
    }
  }, [stompClient]);

  // Form input handler
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  // Send location data
  const sendData = useCallback(() => {
    if (!formData.busId || !formData.longitude || !formData.latitude) {
      alert("Please fill all fields and select a location on the map!");
      return;
    }

    const data = {
      busId: parseInt(formData.busId),
      longitude: formData.longitude,
      latitude: formData.latitude,
    };

    try {
      if (!stompClient) {
        throw new Error("STOMP client is not initialized");
      }

      stompClient.publish({
        destination: "/app/update-location",
        body: JSON.stringify(data),
      });
      console.log("Data sent successfully:", data);
    } catch (error) {
      console.error("Error during data sending:", error);
    }
  }, [stompClient, formData]);

  // Message handling
  const addMessage = (data: BusLocation) => {
    setMessages((prev) => [...prev, data]);
  };

  useEffect(() => {
    if (connected && messages.length === 0) {
      addMessage({
        busId: Number(formData.busId),
        latitude: 30.0444,
        longitude: 31.2357,
      });
    }
  }, [connected]);

  // (Optional) Request notification permission if you want to use browser notifications.
  // You can remove this useEffect if you no longer need system notifications.
  useEffect(() => {
    if (Notification.permission === "default") {
      void Notification.requestPermission().then((permission) => {
        console.log("Notification permission: ", permission);
      });
    }
  }, []);

  return (
    <Container>
      <div className="mx-auto w-full px-4">
        <div className="rounded-lg bg-bgPrimary p-6 shadow-lg">
          <div className="mb-6 flex justify-between space-x-4">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <BusIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="busId"
                className="w-full rounded-lg border border-borderPrimary px-4 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={
                  language === "fr"
                    ? "Entrez l'ID du bus"
                    : language === "ar"
                      ? "أدخل معرف الحافلة"
                      : "Enter Bus ID"
                }
                value={formData.busId}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="flex gap-4">
            <button
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-green-500 px-4 py-2 font-semibold text-white transition-colors duration-200 hover:bg-green-600"
                onClick={sendData}
              >
                <MapPin className="h-5 w-5" />
                {language === "fr"
                  ? "Mettre à jour la localisation"
                  : language === "ar"
                    ? "تحديث الموقع"
                    : "Update Location"}
              </button>
              <button
                className={`inline-flex items-center gap-2 rounded-lg px-6 py-2 font-semibold transition-colors duration-200 ${
                  connected
                    ? "cursor-not-allowed bg-bgSecondary"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                }`}
                onClick={connect}
                disabled={connected}
              >
                <div
                  className={`h-2 w-2 rounded-full ${connected ? "bg-gray-400" : "bg-green-400"}`}
                />
                {language === "fr"
                  ? "Connecter"
                  : language === "ar"
                    ? "توصيل"
                    : "Connect"}
              </button>
              <button
                className={`inline-flex items-center gap-2 rounded-lg px-6 py-2 font-semibold transition-colors duration-200 ${
                  !connected
                    ? "cursor-not-allowed bg-bgSecondary"
                    : "bg-red-500 text-white hover:bg-red-600"
                }`}
                onClick={disconnect}
                disabled={!connected}
              >
                <div
                  className={`h-2 w-2 rounded-full ${!connected ? "bg-gray-400" : "bg-red-400"}`}
                />
                {language === "fr"
                  ? "Déconnecter"
                  : language === "ar"
                    ? "فصل"
                    : "Disconnect"}
              </button>
            </div>
          </div>

          {/* Notification panel: displays the timestamp, title, and description once (after socket connect) */}
          {notification && (
            <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
              <h2 className="text-xl font-bold">{notification.title}</h2>
              <p>{notification.description}</p>
              <p className="text-sm text-gray-600">
                {new Date(notification.timestamp).toLocaleString()}
              </p>
            </div>
          )}

          <div className="relative grid grid-cols-1 gap-6">
            <div className="space-y-6">
              <div style={{ height: screenHeight - 220 }} className="overflow-hidden rounded-lg border border-gray-300">
                <MapContainer
                  center={defaultPosition}
                  zoom={13}
                  className="h-full w-full"
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  {myLocation && (
                    <Marker
                      position={myLocation}
                      icon={createCustomMarkerIcon("#4ade80")}
                    >
                      <Popup>My Location</Popup>
                    </Marker>
                  )}

                  {myLocation && messages.length > 0 && (
                    <Polyline
                      positions={[
                        myLocation,
                        [
                          messages[messages.length - 1]?.latitude ?? 0,
                          messages[messages.length - 1]?.longitude ?? 0,
                        ],
                      ]}
                      color="blue"
                    />
                  )}

                  {myLocation && messages.length > 0 && (
                    <AutoZoom
                      from={myLocation}
                      to={[
                        messages[messages.length - 1]?.latitude ?? 0,
                        messages[messages.length - 1]?.longitude ?? 0,
                      ]}
                    />
                  )}
                  <LocationMarker
                    onLocationSelect={handleLocationSelect}
                    position={markerPosition}
                  />
                </MapContainer>
                {myLocation && messages.length > 0 && (
                  <p className="mt-2 text-sm text-gray-600">
                    Distance:{" "}
                    {calculateDistanceKm(myLocation, [
                      messages[messages.length - 1]?.latitude ?? 0,
                      messages[messages.length - 1]?.longitude ?? 0,
                    ]).toFixed(2)}{" "}
                    km
                  </p>
                )}
              </div>

              
            </div>

            {connected && (
              <div style={{ maxHeight: screenHeight - 260 }} className="absolute right-5 top-5 w-[300px] z-[1000] rounded-lg bg-bgPrimary p-4">
                <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-textPrimary">
                  <MapPin className="h-5 w-5 text-primary" />
                  {language === "fr"
                    ? "Mises à jour de localisation"
                    : language === "ar"
                      ? "تحديثات الموقع"
                      : "Location Updates"}
                </h2>
                <div className="max-h-96 space-y-2 overflow-y-auto">
                  {messages.map((msg, index) => (
                    <div
                      key={index}
                      className="rounded-lg border border-borderPrimary bg-bgPrimary p-3 shadow-sm"
                    >
                      <div className="flex items-center gap-2 font-medium text-textPrimary">
                        <BusIcon className="h-4 w-4 text-primary" />
                        {language === "fr"
                          ? `ID de bus : ${msg.busId}`
                          : language === "ar"
                            ? `رقم معرف الحافلة: ${msg.busId}`
                            : `Bus ID: ${msg.busId}`}
                      </div>
                      {msg.message && (
                        <div className="mb-2 pl-6 text-gray-600">
                          {msg.message}
                        </div>
                      )}
                      <div className="pl-6 text-gray-600">
                        {language === "fr"
                          ? `Longitude : ${msg.longitude.toFixed(6)}\nLatitude : ${msg.latitude.toFixed(6)}`
                          : language === "ar"
                            ? `الخط الطولي: ${msg.longitude.toFixed(6)}\nالعرض: ${msg.latitude.toFixed(6)}`
                            : `Longitude: ${msg.longitude.toFixed(6)}\nLatitude: ${msg.latitude.toFixed(6)}`}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Container>
  );
};

export default Bus;
