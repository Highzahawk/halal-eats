// src/app/page.tsx
"use client";

import { useEffect, useState } from "react";
import { api } from "@/utils/api";

type Restaurant = {
  id: string;
  name: string;
  location: string;
  cuisine: string;
  rating: number;
};

export default function Home() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);

  useEffect(() => {
    async function fetchRestaurants() {
      try {
        const response = await api.get("/restaurants");
        setRestaurants(response.data);
      } catch (error) {
        console.error("Error fetching restaurants:", error);
      }
    }
    fetchRestaurants();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold">Halal Eats</h1>
      <ul className="mt-4 space-y-2">
        {restaurants.map((restaurant) => (
          <li key={restaurant.id} className="border p-4 rounded-md">
            <h2 className="text-lg font-semibold">{restaurant.name}</h2>
            <p>{restaurant.location}</p>
            <p>Cuisine: {restaurant.cuisine}</p>
            <p>Rating: {restaurant.rating} ⭐</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
