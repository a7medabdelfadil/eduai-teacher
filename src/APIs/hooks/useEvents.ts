import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { fetchUpcomingEvents } from "../features/events";
import { EventsResponse } from "../../types";

export const useUpcomingEvents = (options?: UseQueryOptions<EventsResponse, Error>) => {
  return useQuery<EventsResponse, Error>({
    queryKey: ["upcoming-events"],
    queryFn: fetchUpcomingEvents,
    ...options,
  });
};
