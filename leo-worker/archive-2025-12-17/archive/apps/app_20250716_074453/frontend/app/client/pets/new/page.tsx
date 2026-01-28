'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/lib/use-toast';
import { ArrowLeft, Upload, X } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

const dogBreeds = [
  'Mixed Breed', 'Labrador Retriever', 'German Shepherd', 'Golden Retriever', 
  'French Bulldog', 'Bulldog', 'Poodle', 'Beagle', 'Rottweiler', 'Other'
];

const catBreeds = [
  'Mixed Breed', 'Persian', 'Maine Coon', 'Ragdoll', 'British Shorthair', 
  'American Shorthair', 'Siamese', 'Russian Blue', 'Bengal', 'Other'
];

export default function AddPetPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    species: '',
    breed: '',
    dateOfBirth: '',
    sex: '',
    isNeutered: '',
    weight: '',
    weightUnit: 'lbs',
    microchipNumber: '',
    color: '',
    allergies: '',
    conditions: '',
  });

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setPhotoPreview(null);
    const input = document.getElementById('photo') as HTMLInputElement;
    if (input) {
      input.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: 'Pet added successfully!',
        description: `${formData.name} has been added to your pet family.`,
      });
      
      router.push('/client/pets');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add pet. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const breeds = formData.species === 'dog' ? dogBreeds : 
                 formData.species === 'cat' ? catBreeds : [];

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link href="/client/pets">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Pets
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Add New Pet</h1>
        <p className="text-muted-foreground">Add a new member to your pet family</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Pet Information</CardTitle>
            <CardDescription>Enter your pet's details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Photo Upload */}
            <div className="space-y-2">
              <Label htmlFor="photo">Pet Photo (Optional)</Label>
              <div className="flex items-center space-x-4">
                {photoPreview ? (
                  <div className="relative">
                    <img
                      src={photoPreview}
                      alt="Pet preview"
                      className="h-24 w-24 rounded-lg object-cover"
                    />
                    <button
                      type="button"
                      onClick={removePhoto}
                      className="absolute -top-2 -right-2 h-6 w-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="h-24 w-24 border-2 border-dashed border-border rounded-lg flex items-center justify-center">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                <Input
                  id="photo"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="max-w-xs"
                />
              </div>
            </div>

            {/* Basic Information */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Pet Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Max"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="species">Species *</Label>
                <Select
                  value={formData.species}
                  onValueChange={(value) => setFormData({ ...formData, species: value, breed: '' })}
                  required
                >
                  <SelectTrigger id="species">
                    <SelectValue placeholder="Select species" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dog">Dog</SelectItem>
                    <SelectItem value="cat">Cat</SelectItem>
                    <SelectItem value="bird">Bird</SelectItem>
                    <SelectItem value="rabbit">Rabbit</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="breed">Breed *</Label>
                {formData.species === 'dog' || formData.species === 'cat' ? (
                  <Select
                    value={formData.breed}
                    onValueChange={(value) => setFormData({ ...formData, breed: value })}
                    required
                  >
                    <SelectTrigger id="breed">
                      <SelectValue placeholder="Select breed" />
                    </SelectTrigger>
                    <SelectContent>
                      {breeds.map((breed) => (
                        <SelectItem key={breed} value={breed}>{breed}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id="breed"
                    placeholder="Enter breed"
                    value={formData.breed}
                    onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                    required
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  max={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
            </div>

            {/* Sex and Neutered Status */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Sex *</Label>
                <RadioGroup
                  value={formData.sex}
                  onValueChange={(value) => setFormData({ ...formData, sex: value })}
                  required
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="male" id="male" />
                    <Label htmlFor="male" className="font-normal cursor-pointer">Male</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="female" id="female" />
                    <Label htmlFor="female" className="font-normal cursor-pointer">Female</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label>Spayed/Neutered? *</Label>
                <RadioGroup
                  value={formData.isNeutered}
                  onValueChange={(value) => setFormData({ ...formData, isNeutered: value })}
                  required
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="neutered-yes" />
                    <Label htmlFor="neutered-yes" className="font-normal cursor-pointer">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="neutered-no" />
                    <Label htmlFor="neutered-no" className="font-normal cursor-pointer">No</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="unknown" id="neutered-unknown" />
                    <Label htmlFor="neutered-unknown" className="font-normal cursor-pointer">Unknown</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            {/* Weight and Additional Info */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="weight">Weight *</Label>
                <div className="flex space-x-2">
                  <Input
                    id="weight"
                    type="number"
                    placeholder="0"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    min="0.1"
                    step="0.1"
                    required
                    className="flex-1"
                  />
                  <Select
                    value={formData.weightUnit}
                    onValueChange={(value) => setFormData({ ...formData, weightUnit: value })}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lbs">lbs</SelectItem>
                      <SelectItem value="kg">kg</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="microchipNumber">Microchip Number (Optional)</Label>
                <Input
                  id="microchipNumber"
                  placeholder="15 digits"
                  value={formData.microchipNumber}
                  onChange={(e) => setFormData({ ...formData, microchipNumber: e.target.value })}
                  maxLength={15}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="color">Color/Markings (Optional)</Label>
                <Input
                  id="color"
                  placeholder="e.g., Golden, Black and white"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                />
              </div>
            </div>

            {/* Medical Information */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="allergies">Known Allergies (Optional)</Label>
                <Textarea
                  id="allergies"
                  placeholder="List any known allergies, separated by commas"
                  value={formData.allergies}
                  onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="conditions">Medical Conditions (Optional)</Label>
                <Textarea
                  id="conditions"
                  placeholder="List any medical conditions or special needs"
                  value={formData.conditions}
                  onChange={(e) => setFormData({ ...formData, conditions: e.target.value })}
                  rows={2}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex space-x-2">
            <Link href="/client/pets" className="flex-1">
              <Button type="button" variant="outline" className="w-full">
                Cancel
              </Button>
            </Link>
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? 'Adding Pet...' : 'Add Pet'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}