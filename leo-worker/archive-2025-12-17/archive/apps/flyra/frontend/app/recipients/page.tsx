'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AuthCheck } from '@/components/auth-check';
import { DashboardNav } from '@/components/dashboard-nav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Search,
  Plus,
  MoreVertical,
  Send,
  Edit,
  Trash2,
  Star,
  Filter,
  Users,
  Grid3X3,
  List
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { Recipient } from '@/types';
import { formatPhoneNumber } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

export default function RecipientsPage() {
  const { toast } = useToast();
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [filteredRecipients, setFilteredRecipients] = useState<Recipient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCountry, setFilterCountry] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [isBulkMode, setIsBulkMode] = useState(false);

  useEffect(() => {
    loadRecipients();
  }, []);

  useEffect(() => {
    filterRecipients();
  }, [searchQuery, filterCountry, recipients]);

  const loadRecipients = async () => {
    try {
      const data = await apiClient.getRecipients();
      setRecipients(data);
      setFilteredRecipients(data);
    } catch (error) {
      toast({
        title: 'Error loading recipients',
        description: 'Please refresh the page',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterRecipients = () => {
    let filtered = recipients;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(r => 
        r.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.phoneNumber.includes(searchQuery) ||
        r.city.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Country filter
    if (filterCountry !== 'all') {
      filtered = filtered.filter(r => r.country === filterCountry);
    }

    setFilteredRecipients(filtered);
  };

  const handleDelete = async (recipientId: string) => {
    if (!confirm('Are you sure you want to delete this recipient?')) return;

    try {
      await apiClient.deleteRecipient(recipientId);
      toast({
        title: 'Recipient deleted',
        description: 'The recipient has been removed from your list',
      });
      loadRecipients();
    } catch (error) {
      toast({
        title: 'Error deleting recipient',
        description: 'Please try again',
        variant: 'destructive',
      });
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedRecipients.length} recipients?`)) return;

    try {
      // In a real app, this would be a bulk API call
      for (const id of selectedRecipients) {
        await apiClient.deleteRecipient(id);
      }
      toast({
        title: 'Recipients deleted',
        description: `${selectedRecipients.length} recipients have been removed`,
      });
      setSelectedRecipients([]);
      setIsBulkMode(false);
      loadRecipients();
    } catch (error) {
      toast({
        title: 'Error deleting recipients',
        description: 'Please try again',
        variant: 'destructive',
      });
    }
  };

  const toggleFavorite = async (recipientId: string) => {
    const recipient = recipients.find(r => r.id === recipientId);
    if (!recipient) return;

    try {
      await apiClient.updateRecipient(recipientId, { isFavorite: !recipient.isFavorite });
      toast({
        title: recipient.isFavorite ? 'Removed from favorites' : 'Added to favorites',
      });
      loadRecipients();
    } catch (error) {
      toast({
        title: 'Error updating favorite',
        variant: 'destructive',
      });
    }
  };

  const toggleSelectRecipient = (recipientId: string) => {
    setSelectedRecipients(prev => 
      prev.includes(recipientId) 
        ? prev.filter(id => id !== recipientId)
        : [...prev, recipientId]
    );
  };

  const getCountryFlag = (countryCode: string) => {
    const flags: Record<string, string> = {
      'KE': '🇰🇪',
      'NG': '🇳🇬',
      'GH': '🇬🇭',
      'ZA': '🇿🇦',
      'UG': '🇺🇬',
      'TZ': '🇹🇿',
      'RW': '🇷🇼',
      'IN': '🇮🇳',
    };
    return flags[countryCode] || '🌍';
  };

  if (isLoading) {
    return (
      <AuthCheck>
        <div className="min-h-screen bg-background">
          <DashboardNav />
          <div className="container py-6">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-muted rounded w-1/4" />
              <div className="h-12 bg-muted rounded" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="h-32 bg-muted rounded-lg" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </AuthCheck>
    );
  }

  return (
    <AuthCheck>
      <div className="min-h-screen bg-background">
        <DashboardNav />

        <main className="container py-6 pb-24 md:pb-6">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold">Recipients</h1>
                <p className="text-muted-foreground">
                  Manage your recipients and send money quickly
                </p>
              </div>
              <Link href="/recipients/add">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Recipient
                </Button>
              </Link>
            </div>

            {/* Search and Filters */}
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        placeholder="Search by name, phone, or location"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Select value={filterCountry} onValueChange={setFilterCountry}>
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="All countries" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All countries</SelectItem>
                        <SelectItem value="KE">Kenya</SelectItem>
                        <SelectItem value="NG">Nigeria</SelectItem>
                        <SelectItem value="GH">Ghana</SelectItem>
                        <SelectItem value="IN">India</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="hidden md:flex border rounded-md">
                      <Button
                        variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                        size="icon"
                        onClick={() => setViewMode('list')}
                        className="rounded-r-none"
                      >
                        <List className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                        size="icon"
                        onClick={() => setViewMode('grid')}
                        className="rounded-l-none"
                      >
                        <Grid3X3 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Bulk Actions */}
            {isBulkMode && selectedRecipients.length > 0 && (
              <Card className="border-primary">
                <CardContent className="py-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm">
                      {selectedRecipients.length} recipient{selectedRecipients.length > 1 ? 's' : ''} selected
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedRecipients([]);
                          setIsBulkMode(false);
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleBulkDelete}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Selected
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recipients List/Grid */}
            {filteredRecipients.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No recipients found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery || filterCountry !== 'all' 
                      ? 'Try adjusting your search filters'
                      : 'Add your first recipient to start sending money'
                    }
                  </p>
                  {!searchQuery && filterCountry === 'all' && (
                    <Link href="/recipients/add">
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Your First Recipient
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className={cn(
                viewMode === 'grid' 
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                  : "space-y-2"
              )}>
                {filteredRecipients.map((recipient) => (
                  viewMode === 'grid' ? (
                    // Grid View
                    <Card key={recipient.id} className="relative">
                      {isBulkMode && (
                        <div className="absolute top-4 left-4 z-10">
                          <Checkbox
                            checked={selectedRecipients.includes(recipient.id)}
                            onCheckedChange={() => toggleSelectRecipient(recipient.id)}
                          />
                        </div>
                      )}
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback>
                              {recipient.firstName[0]}{recipient.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => toggleFavorite(recipient.id)}
                            >
                              <Star className={cn(
                                "h-4 w-4",
                                recipient.isFavorite && "fill-yellow-400 text-yellow-400"
                              )} />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                  <Link href={`/send?recipient=${recipient.id}`}>
                                    <Send className="mr-2 h-4 w-4" />
                                    Send Money
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link href={`/recipients/${recipient.id}/edit`}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => handleDelete(recipient.id)}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                        <Link href={`/recipients/${recipient.id}`}>
                          <h3 className="font-semibold mb-1 hover:underline">
                            {recipient.firstName} {recipient.lastName}
                          </h3>
                        </Link>
                        <p className="text-sm text-muted-foreground mb-2">
                          {getCountryFlag(recipient.country)} {recipient.city}
                        </p>
                        <p className="text-sm text-muted-foreground mb-3">
                          {formatPhoneNumber(recipient.phoneNumber)}
                        </p>
                        {recipient.lastTransactionDate && (
                          <p className="text-xs text-muted-foreground">
                            Last sent: {new Date(recipient.lastTransactionDate).toLocaleDateString()}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ) : (
                    // List View
                    <Card key={recipient.id}>
                      <CardContent 
                        className="p-4 cursor-pointer hover:bg-accent transition-colors"
                        onClick={(e) => {
                          if (isBulkMode) {
                            e.preventDefault();
                            toggleSelectRecipient(recipient.id);
                          }
                        }}
                        onMouseDown={(e) => {
                          if (!isBulkMode && e.detail === 2) {
                            e.preventDefault();
                            setIsBulkMode(true);
                            setSelectedRecipients([recipient.id]);
                          }
                        }}
                      >
                        <div className="flex items-center gap-4">
                          {isBulkMode && (
                            <Checkbox
                              checked={selectedRecipients.includes(recipient.id)}
                              onCheckedChange={() => toggleSelectRecipient(recipient.id)}
                              onClick={(e) => e.stopPropagation()}
                            />
                          )}
                          <Avatar>
                            <AvatarFallback>
                              {recipient.firstName[0]}{recipient.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <Link
                              href={`/recipients/${recipient.id}`}
                              onClick={(e) => isBulkMode && e.preventDefault()}
                            >
                              <h3 className="font-semibold hover:underline">
                                {recipient.firstName} {recipient.lastName}
                              </h3>
                            </Link>
                            <p className="text-sm text-muted-foreground">
                              {getCountryFlag(recipient.country)} {recipient.city} • {formatPhoneNumber(recipient.phoneNumber)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {recipient.isFavorite && (
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            )}
                            {recipient.lastTransactionDate && (
                              <span className="text-sm text-muted-foreground hidden md:block">
                                {new Date(recipient.lastTransactionDate).toLocaleDateString()}
                              </span>
                            )}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                  <Link href={`/send?recipient=${recipient.id}`}>
                                    <Send className="mr-2 h-4 w-4" />
                                    Send Money
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link href={`/recipients/${recipient.id}/edit`}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleFavorite(recipient.id);
                                  }}
                                >
                                  <Star className="mr-2 h-4 w-4" />
                                  {recipient.isFavorite ? 'Remove from Favorites' : 'Set as Favorite'}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(recipient.id);
                                  }}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                ))}
              </div>
            )}
          </div>
        </main>

        {/* Floating Action Button on Mobile */}
        <Link
          href="/recipients/add"
          className="fixed bottom-20 right-4 md:hidden z-50"
        >
          <Button size="icon" className="h-14 w-14 rounded-full shadow-lg">
            <Plus className="h-6 w-6" />
          </Button>
        </Link>
      </div>
    </AuthCheck>
  );
}