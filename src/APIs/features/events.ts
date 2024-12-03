import axiosInstance from "../axios";
import { EventsResponse } from "../../types";

export const fetchUpcomingEvents = async (): Promise<EventsResponse> => {
  const response = await axiosInstance.get<EventsResponse>("/api/v1/dashboard/upcoming-events");
  return response.data;
};
