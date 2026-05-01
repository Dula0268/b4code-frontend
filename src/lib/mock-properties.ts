export interface Property {
  id: string
  name: string
  location: string
  rating: number
  price: number
  image: string
  description: string
}

export const ALL_PROPERTIES: Property[] = [
  {
    id: "1",
    name: "Luxury Beach Resort",
    location: "Maldives",
    rating: 4.8,
    price: 250,
    image: "/images/properties/resort1.jpg",
    description: "Experience luxury at our beachfront resort with world-class amenities."
  },
  {
    id: "2",
    name: "Mountain Retreat",
    location: "Switzerland",
    rating: 4.6,
    price: 180,
    image: "/images/properties/resort2.jpg",
    description: "Cozy mountain lodge with stunning alpine views."
  },
  {
    id: "3",
    name: "City Center Hotel",
    location: "New York",
    rating: 4.5,
    price: 200,
    image: "/images/properties/resort3.jpg",
    description: "Stay in the heart of the city with easy access to all attractions."
  }
]

export function getPropertyById(id: string): Property | undefined {
  return ALL_PROPERTIES.find(p => p.id === id)
}
