'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/auth-context';
import { getMockPetsByOwner } from '@/lib/mock-data';
import { Pet } from '@/types';
import { Plus, Calendar, FileText, Weight, Cake, MapPin } from 'lucide-react';
import { format, differenceInYears } from 'date-fns';

export default function PetsPage() {
  const { user } = useAuth();
  const [pets, setPets] = useState<Pet[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      // Simulate API call
      setTimeout(() => {
        setPets(getMockPetsByOwner(user.id));
        setIsLoading(false);
      }, 1000);
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  const calculateAge = (dateOfBirth: string) => {
    const years = differenceInYears(new Date(), new Date(dateOfBirth));
    if (years === 0) {
      const months = Math.floor((new Date().getTime() - new Date(dateOfBirth).getTime()) / (1000 * 60 * 60 * 24 * 30));
      return `${months} month${months !== 1 ? 's' : ''}`;
    }
    return `${years} year${years !== 1 ? 's' : ''}`;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">My Pets</h1>
          <p className="text-muted-foreground">Manage your furry family members</p>
        </div>
        <Link href="/client/pets/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add New Pet
          </Button>
        </Link>
      </div>

      {/* Pets Grid */}
      {pets.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">🐾</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">No pets added yet</h3>
            <p className="text-muted-foreground mb-4">Add your furry family members to get started</p>
            <Link href="/client/pets/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Pet
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {pets.map((pet) => (
            <Card key={pet.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-[4/3] relative">
                {pet.photo ? (
                  <img
                    src={pet.photo}
                    alt={pet.name}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <span className="text-6xl">
                      {pet.species === 'dog' ? '🐕' : pet.species === 'cat' ? '🐈' : '🐾'}
                    </span>
                  </div>
                )}
                {pet.microchipNumber && (
                  <Badge className="absolute top-2 right-2" variant="secondary">
                    <MapPin className="h-3 w-3 mr-1" />
                    Microchipped
                  </Badge>
                )}
              </div>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{pet.name}</CardTitle>
                    <CardDescription>
                      {pet.species === 'dog' ? '🐕' : pet.species === 'cat' ? '🐈' : '🐾'} {pet.breed}
                    </CardDescription>
                  </div>
                  <Badge variant={pet.sex === 'male' ? 'default' : 'secondary'}>
                    {pet.sex === 'male' ? '♂' : '♀'} {pet.isNeutered ? 'Fixed' : 'Intact'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Cake className="h-4 w-4 text-muted-foreground" />
                    <span>{calculateAge(pet.dateOfBirth)} old</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Weight className="h-4 w-4 text-muted-foreground" />
                    <span>{pet.weight} {pet.weightUnit}</span>
                  </div>
                </div>
                
                {pet.allergies && pet.allergies.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {pet.allergies.map((allergy, i) => (
                      <Badge key={i} variant="destructive" className="text-xs">
                        {allergy}
                      </Badge>
                    ))}
                  </div>
                )}
                
                <div className="flex gap-2">
                  <Link href={`/client/pets/${pet.id}`} className="flex-1">
                    <Button variant="default" className="w-full" size="sm">
                      View Profile
                    </Button>
                  </Link>
                  <Link href={`/client/appointments/book?pet=${pet.id}`} className="flex-1">
                    <Button variant="outline" className="w-full" size="sm">
                      <Calendar className="mr-2 h-4 w-4" />
                      Book
                    </Button>
                  </Link>
                  <Link href={`/client/records?pet=${pet.id}`}>
                    <Button variant="outline" size="sm">
                      <FileText className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}