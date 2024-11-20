import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import config from "./../../config";

export const sessionApi = createApi({
  reducerPath: "sessionApi",
  baseQuery: fetchBaseQuery({ baseUrl: config.baseURL }),
  endpoints: (builder) => ({
    getSession: builder.query({
      query({ page = 1, perPage = 10 }) {
        return {
          url: `session?page=${page}&perPage=${perPage}`,
          method: "GET",
        };
      },
    }),
    getSessionById: builder.query({
      query({ sessionId }) {
        return {
          url: `session/${sessionId}`,
          method: "GET",
        };
      },
    }),
  }),
});

export const { useGetSessionQuery, useGetSessionByIdQuery } = sessionApi;
