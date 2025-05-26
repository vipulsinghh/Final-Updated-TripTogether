
"use client";

import { useState, useEffect, useCallback } from "react";
import type { Trip } from '@/types'; 
import TripCard from '@/components/core/trip-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Mountain, Palmtree, Sun, MountainSnow, Snowflake, Search, RotateCcw, Landmark, Palette, Building2, Bike, Navigation, Tag, Users as UsersIcon, Briefcase, ThumbsUp, Zap, DollarSign, UserCog } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from 'next/link';
import { categoriesList as appCategories } from '@/types'; 
import { db } from '@/lib/firebase'; // Assuming your firebase client config is here
import { collection, getDocs } from 'firebase/firestore';

// Sample Trip Data
// Reintroducing the sample data as a constant outside the component
const initialTrips: Trip[] = [
  {
    id: '1',
    title: 'Tropical Beach Getaway',
    destination: 'Maldives',
    startLocation: 'Male International Airport (MLE)',
    startDate: new Date('2024-11-15'),
    endDate: new Date('2024-11-22'),
    description: 'Relax on pristine beaches, snorkel in crystal-clear waters, and enjoy stunning sunsets.',
    imageUrls: ['https://www.beachcomber.mu/sites/default/files/styles/fullscreen_image/public/2022-01/MBL-Adult-Pool-Exterior-1920x1080.jpg?itok=o6R4eA_2'],
    dataAiHint: 'beach tropical maldives',
    maxGroupSize: 6,
    currentMemberCount: 3,
    budget: '$2500 - $3500',
    categories: ['Beach', 'Wellness'],
    createdById: 'user1',
    creatorName: 'BeachLover',
    smokingPolicy: 'outside_only',
    alcoholPolicy: 'permitted',
    genderPreference: 'any',
    targetAgeGroup: '26-45',
    targetTravelerType: 'couples',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    title: 'Northern Lights Hunt',
    destination: 'Iceland',
    startLocation: 'Reykjavik City',
    startDate: new Date('2024-12-01'),
    endDate: new Date('2024-12-08'),
    description: 'Chase the magical Northern Lights, explore ice caves, and soak in geothermal pools.',
    imageUrls: ['https://www.tripsavvy.com/thmb/SjXkG3Y_41tE9m73pPj-A2p_P1I=/2120x1414/filters:fill(auto,1)/Aurora-Borealis-over-water-and-mountains-565202289-588242293df78c2f7227ff95.jpg'],
    dataAiHint: 'northern lights iceland',
    maxGroupSize: 8,
    currentMemberCount: 5,
    budget: '$3000 - $4000',
    categories: ['Ice & Snow', 'Adventure'],
    createdById: 'user2',
    creatorName: 'AuroraSeeker',
    smokingPolicy: 'not_permitted',
    alcoholPolicy: 'socially',
    genderPreference: 'mixed',
    targetAgeGroup: 'any',
    targetTravelerType: 'friends',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    title: 'Paris Romantic Getaway',
    destination: 'Paris, France',
    startLocation: 'Charles de Gaulle Airport (CDG)',
    startDate: new Date('2024-12-01'), // Corrected end date issue from original prompt
    endDate: new Date('2024-12-07'),
    description: 'Indulge in art, cuisine, and romance in the City of Lights. Visit museums, enjoy cafes, and stroll along the Seine.',
    imageUrls: ['https://cdn.bhdw.net/im/eiffel-tower-paris-wallpaper-80283_w635.webp'],
    dataAiHint: 'paris eiffel tower',
    maxGroupSize: 4,
    currentMemberCount: 2,
    budget: '$1800 - $2200',
    categories: ['City Break', 'Cultural', 'Historical', 'Foodie'],
     createdById: 'user3',
    creatorName: 'ArtBuff',
    smokingPolicy: 'not_permitted',
    alcoholPolicy: 'socially',
    genderPreference: 'couples',
    targetAgeGroup: 'any',
    targetTravelerType: 'couples',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];
const categoryIcons: { [key: string]: React.ElementType } = {
  'Mountains': Mountain,
  'Beach': Palmtree,
  'Desert': Sun,
  'Hill Stations': MountainSnow,
  'Ice & Snow': Snowflake,
  'Historical': Landmark,
  'Cultural': Palette,
  'City Break': Building2,
  'Adventure': Bike,
  'Road Trip': Navigation,
  'Wildlife': Briefcase, 
  'Wellness': ThumbsUp, 
  'Foodie': Zap, 
  'Nightlife': Zap, 
  'Budget': DollarSign, 
};


export default function DiscoverPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [profilePreferencesSet, setProfilePreferencesSet] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    const fetchTrips = async () => {
      setLoading(true);
      setError(null);
      try {
        const querySnapshot = await getDocs(collection(db, 'trips'));
        const firestoreTrips: Trip[] = [];
        querySnapshot.forEach((doc) => {
          // Explicitly cast doc.data() to the structure you expect
          const data = doc.data();
          firestoreTrips.push({
            id: doc.id,
            title: data.title,
            destination: data.destination,
            startLocation: data.startLocation,
            startDate: data.startDate.toDate(), // Convert Firestore Timestamp to Date
            endDate: data.endDate.toDate(), // Convert Firestore Timestamp to Date
            description: data.description,
            imageUrls: data.imageUrls || [], // Ensure imageUrls is an array
            dataAiHint: data.dataAiHint || '',
            maxGroupSize: data.maxGroupSize,
            currentMemberCount: data.currentMemberCount || 0, // Default to 0 if not present
            budget: data.budget || '',
            categories: data.categories || [], // Ensure categories is an array
            createdById: data.userId, // Assuming userId is stored
            creatorName: data.creatorName || 'Unknown', // Default name
            smokingPolicy: data.smokingPolicy || 'any', // Default policy
            alcoholPolicy: data.alcoholPolicy || 'any', // Default policy
            genderPreference: data.genderPreference || 'any', // Default preference
            targetAgeGroup: data.targetAgeGroup || 'any', // Default age group
            targetTravelerType: data.targetTravelerType || 'any', // Default traveler type
            createdAt: data.createdAt ? data.createdAt.toDate() : new Date(), // Convert Timestamp
            updatedAt: data.updatedAt ? data.updatedAt.toDate() : new Date(), // Convert Timestamp
          } as Trip); 
        });

        // Combine Firestore data with initial sample data
        // Create a map of Firestore trip IDs for quick lookup
        const firestoreTripIds = new Set(firestoreTrips.map(trip => trip.id));
        // Filter out sample trips that are already present in Firestore
        const uniqueInitialTrips = initialTrips.filter(trip => !firestoreTripIds.has(trip.id));

        // Combine the unique initial trips with the fetched Firestore trips
        setTrips([...uniqueInitialTrips, ...firestoreTrips]);
      } catch (err: any) {
        console.error("Error fetching trips:", err);
        setError("Failed to fetch trips. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    // Fetch from Firestore when the component mounts
    fetchTrips();
    
  }, []); // Empty dependency array means this effect runs once on mount

    // Clear the initial trips and only show fetched ones
  const handleResetFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedCategory(null);
  }, []);

  const handleCategorySelect = useCallback((categoryName: string) => {
    if (selectedCategory === categoryName) {
      setSelectedCategory(null); 
    } else {
      setSelectedCategory(categoryName);
    }
  }, [selectedCategory]);

   // Placeholder for fetching user profile preferences (if needed for filtering/recommendations)
  useEffect(() => {
     if (typeof window !== 'undefined') {
      const preferencesSet = localStorage.getItem('userProfilePreferencesSet') === 'true';
      setProfilePreferencesSet(preferencesSet);
    }
  }, [selectedCategory]);

  const filteredTrips = trips.filter(trip => {
    const matchesSearch = searchTerm === '' || 
                          trip.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          trip.destination.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === null || (trip.categories && trip.categories.includes(selectedCategory));
    
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-8rem)]">
        <RotateCcw className="h-10 w-10 text-primary animate-spin mr-2" />
        <p className="text-xl">Loading trips...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="max-w-md mx-auto my-8">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {error}
        </AlertDescription>
      </Alert>
    );
  }

  if (profilePreferencesSet === null) { 
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-8rem)]">
        <RotateCcw className="h-10 w-10 text-primary animate-spin mr-2" /> 
        <p className="text-xl">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-6 md:space-y-8">
      {profilePreferencesSet === false && (
        <Alert variant="default" className="border-primary bg-primary/5">
          <UserCog className="h-5 w-5 text-primary" />
          <AlertTitle className="font-semibold text-primary">Complete Your Profile!</AlertTitle>
          <AlertDescription className="text-foreground/80">
            To get the best travel recommendations and connect with groups tailored to your interests, please complete your profile preferences.
          </AlertDescription>
          <div className="mt-4">
            <Button asChild size="sm">
              <Link href="/profile">Go to Profile</Link>
            </Button>
          </div>
        </Alert>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input 
          type="text" 
          placeholder="Search trips by title or destination..." 
          className="pl-10 pr-4 py-3 rounded-lg shadow-sm text-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl md:text-2xl font-semibold flex items-center"><Tag className="mr-2 h-5 w-5 md:h-6 md:w-6 text-primary" />Categories</h2>
        </div>
        <ScrollArea className="w-full whitespace-nowrap rounded-md">
          <div className="flex space-x-3 sm:space-x-4 pb-4">
            {appCategories.map((category) => {
              const IconComponent = categoryIcons[category.id] || Tag; 
              return (
                <Button 
                  key={category.id} 
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  className="flex flex-col items-center justify-center h-24 w-24 p-2 rounded-lg shadow-md transition-all hover:shadow-lg"
                  onClick={() => handleCategorySelect(category.id)}
                >
                  <IconComponent className={`h-8 w-8 mb-1 sm:mb-2 ${selectedCategory === category.id ? 'text-primary-foreground' : 'text-primary'}`} />
                  <span className="text-xs font-medium text-center break-words">{category.name}</span>
                </Button>
              );
            })}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      <div>
        <div className="flex justify-between items-center mb-4 md:mb-6">
          <h2 className="text-xl md:text-2xl font-semibold">
            {selectedCategory ? `${selectedCategory} Trips` : "Recommended Trips"}
          </h2>
           {(searchTerm || selectedCategory) && (
            <Button onClick={handleResetFilters} variant="outline" size="sm">
              <RotateCcw className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              Clear Filters
            </Button>
          )}
        </div>
        {filteredTrips.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {filteredTrips.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[200px] text-center py-10">
             <UsersIcon className="h-12 w-12 md:h-16 md:w-16 text-muted-foreground mb-4" />
            <p className="text-lg md:text-xl text-muted-foreground mb-4">No trips match your current search or filters.</p>
            <Button onClick={handleResetFilters} variant="outline">
              <RotateCcw className="mr-2 h-4 w-4" />
              Clear Filters & Reload All
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
