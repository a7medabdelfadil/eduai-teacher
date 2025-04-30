"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Client, type Frame, type Message } from "@stomp/stompjs";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import { MapPin, Bus as BusIcon } from "lucide-react";
import { divIcon } from "leaflet";
import { renderToString } from "react-dom/server";
import Cookies from "js-cookie";
import { baseUrlStock } from "~/APIs/axios";
import useLanguageStore from "~/APIs/store";
import Container from "~/_components/Container";
import "leaflet/dist/leaflet.css";
import { IoClose, IoEye } from "react-icons/io5";
import Button from "~/_components/Button";
import { useBusInfo } from "~/APIs/hooks/useBus";
import { Skeleton } from "~/components/ui/skeleton";

interface FormData {
  busId: string;
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

const createCustomMarkerIcon = (color: string) => {
  const iconHtml = renderToString(
    <div className="relative">
      <MapPin size={32} color={color} fill={color} fillOpacity={0.2} />
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

const AutoZoom = ({ from, to }: { from: [number, number]; to: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.fitBounds([from, to], { padding: [50, 50] });
  }, [from, to, map]);
  return null;
};

const TeacherBusTracking: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({ busId: "" });
  const [connected, setConnected] = useState(false);
  const [busLocation, setBusLocation] = useState<[number, number] | null>(null);
  const [currentLocation, setCurrentLocation] = useState<[number, number] | null>(null);
  const [messages, setMessages] = useState<BusLocation[]>([]);
  const [notification, setNotification] = useState<NotificationData | null>(null);
  const [screenHeight, setScreenHeight] = useState<number>(window.innerHeight);
  const [showUpdatesPanel, setShowUpdatesPanel] = useState(true);

  const token = Cookies.get("token");
  const language = useLanguageStore((state) => state.language);
  const userId = 8;

  const [stompClient, setStompClient] = useState<Client | null>(null);
  const busIdNumber = parseInt(formData.busId);
  const { data: busInfo, isLoading: isBusLoading } = useBusInfo(
    connected && formData.busId ? busIdNumber : undefined,
  );

  useEffect(() => {
    const handleResize = () => setScreenHeight(window.innerHeight);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.error("Error getting location:", error);
        },
      );
    }
  }, []);

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
      client.subscribe(`/topic/bus-location/${formData.busId}`, (message: Message) => {
        const rawData: RawBusData = JSON.parse(message.body);
        const data: BusLocation = {
          message: rawData.message,
          busId: rawData.data.id,
          longitude: rawData.data.longitude,
          latitude: rawData.data.latitude,
        };
        setMessages((prev) => [...prev, data]);
        setBusLocation([data.latitude, data.longitude]);
      });

      client.subscribe(`/user/${userId}/notifications`, (message: Message) => {
        const rawData: NotificationData = JSON.parse(message.body);
        setNotification((current) => current || rawData);
      });
    };

    client.onWebSocketError = (error: Event) => console.error("WebSocket error:", error);
    client.onStompError = (frame: Frame) => console.error("Broker error:", frame.headers.message, frame.body);

    setStompClient(client);
    client.activate();

    return () => {
      if (client.connected) void client.deactivate();
    };
  }, [userId, token, formData.busId]);

  const connect = useCallback(() => {
    if (stompClient && !connected && formData.busId) stompClient.activate();
  }, [stompClient, connected, formData.busId]);

  const disconnect = useCallback(() => {
    if (stompClient && connected) {
      stompClient.deactivate();
      setConnected(false);
      setBusLocation(null);
      setMessages([]);
    }
  }, [stompClient, connected]);

  const defaultPosition: [number, number] = currentLocation || [29.261243, -9.873053];

  return (
    <Container>
      <div className="mx-auto w-full px-2">
        <div className="rounded-lg bg-bgPrimary p-6 shadow-lg">
          <div className="mb-6 flex justify-between space-x-4">
            <input
              type="text"
              value={formData.busId}
              onChange={(e) => setFormData({ busId: e.target.value })}
              className="w-full rounded-lg border border-borderPrimary px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={language === "fr" ? "Entrez l'ID du bus" : language === "ar" ? "أدخل معرف الحافلة" : "Enter Bus ID"}
            />
            <div className="flex gap-4">
              <button
                className={`inline-flex items-center gap-2 rounded-lg px-6 py-2 font-semibold transition-colors duration-200 ${connected ? "cursor-not-allowed bg-bgSecondary" : "bg-blue-500 text-white hover:bg-blue-600"}`}
                onClick={connect}
                disabled={connected}
              >
                <div className={`h-2 w-2 rounded-full ${connected ? "bg-gray-400" : "bg-green-400"}`} />
                {language === "fr" ? "Connecter" : language === "ar" ? "توصيل" : "Connect"}
              </button>
              <button
                className={`inline-flex items-center gap-2 rounded-lg px-6 py-2 font-semibold transition-colors duration-200 ${!connected ? "cursor-not-allowed bg-bgSecondary" : "bg-red-500 text-white hover:bg-red-600"}`}
                onClick={disconnect}
                disabled={!connected}
              >
                <div className={`h-2 w-2 rounded-full ${!connected ? "bg-gray-400" : "bg-red-400"}`} />
                {language === "fr" ? "Déconnecter" : language === "ar" ? "فصل" : "Disconnect"}
              </button>
            </div>
          </div>

          {notification && (
            <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
              <h2 className="text-xl font-bold">{notification.title}</h2>
              <p>{notification.description}</p>
              <p className="text-sm text-gray-600">
                {new Date(notification.timestamp).toLocaleString()}
              </p>
            </div>
          )}

          <div style={{ height: screenHeight - 250 }} className="relative overflow-hidden rounded-lg border border-gray-300">
            <MapContainer center={defaultPosition} zoom={13} className="h-full w-full">
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

              {currentLocation && (
                <Marker position={currentLocation} icon={createCustomMarkerIcon("#4ade80")}>
                  <Popup>My Location</Popup>
                </Marker>
              )}

              {busLocation && (
                <Marker position={busLocation} icon={createCustomMarkerIcon("#ff0000")}>
                  <Popup>Bus Location</Popup>
                </Marker>
              )}

              {currentLocation && busLocation && (
                <>
                  <Polyline positions={[currentLocation, busLocation]} color="blue" dashArray="6" weight={5} />
                  <AutoZoom from={currentLocation} to={busLocation} />
                </>
              )}
            </MapContainer>

            {connected && (
              <button onClick={() => setShowUpdatesPanel(!showUpdatesPanel)} className="absolute right-7 top-7 z-[1100] flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white shadow-lg transition hover:bg-primaryHover">
                {showUpdatesPanel ? <IoClose className="h-5 w-5" /> : <IoEye className="h-4 w-4" />}
              </button>
            )}

            {connected && showUpdatesPanel && (
              <div style={{ maxHeight: screenHeight - 260 }} className="absolute right-5 top-5 z-[1000] w-[300px] rounded-lg bg-bgPrimary p-4">
                <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-textPrimary">
                  <MapPin className="h-5 w-5 text-primary" />
                  {language === "fr" ? "Mises à jour de localisation" : language === "ar" ? "تحديثات الموقع" : "Location Updates"}
                </h2>
                <div className="max-h-96 space-y-2 overflow-y-auto">
                  {messages.map((msg, index) => (
                    <div key={index} className="rounded-lg border border-borderPrimary bg-bgPrimary p-3 shadow-sm">
                      <div className="flex items-center gap-2 font-medium text-textPrimary">
                        <BusIcon className="h-4 w-4 text-primary" />
                        {language === "fr" ? `ID de bus : ${msg.busId}` : language === "ar" ? `رقم معرف الحافلة: ${msg.busId}` : `Bus ID: ${msg.busId}`}
                      </div>
                      {msg.message && <div className="mb-2 pl-6 text-gray-600">{msg.message}</div>}
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
                <div className="mt-4 border-t pt-3">
                  {isBusLoading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-4 w-1/4" />
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-4 w-2/3" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  ) : busInfo ? (
                    <>
                      <p><strong>Driver Name:</strong> {busInfo.driverName}</p>
                      <p><strong>Bus No.:</strong> {busInfo.busNumber}</p>
                      <p><strong>Bus Speed:</strong> {busInfo.speed} km/h</p>
                      <p><strong>Phone:</strong> +{busInfo.phoneNumber.countryCode} {busInfo.phoneNumber.nationalNumber}</p>
                      <Button className="mt-4" onClick={() => {
                        window.open(`tel:+${busInfo.phoneNumber.countryCode}${busInfo.phoneNumber.nationalNumber}`);
                      }}>
                        Call Driver
                      </Button>
                    </>
                  ) : (
                    <p>No bus info available</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Container>
  );
};

export default TeacherBusTracking;
