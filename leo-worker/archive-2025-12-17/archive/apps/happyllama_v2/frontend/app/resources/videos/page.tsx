'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  PlayIcon,
  EyeIcon,
  CalendarIcon,
  MagnifyingGlassIcon,
  VideoCameraIcon
} from '@heroicons/react/24/outline';
import Layout from '@/components/layout';

interface Video {
  id: string;
  title: string;
  description: string;
  category: 'Getting Started' | 'Advanced Features' | 'Use Cases' | 'Technical Deep Dive';
  duration: string;
  views: number;
  publishDate: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  thumbnail: string;
  videoUrl?: string;
  isNew?: boolean;
  isPremium?: boolean;
}

const videos: Video[] = [
  {
    id: 'getting-started-intro',
    title: 'Getting Started with Happy Llama',
    description: 'Learn the basics of creating your first app with Happy Llama in under 10 minutes.',
    category: 'Getting Started',
    duration: '9:32',
    views: 15420,
    publishDate: '2024-01-15',
    difficulty: 'Beginner',
    thumbnail: '/images/video-intro.png',
    videoUrl: 'https://youtube.com/watch?v=demo',
    isNew: false
  },
  {
    id: 'from-idea-to-app',
    title: 'From Idea to Working App in 30 Minutes',
    description: 'Watch as we build a complete todo app from just a text description.',
    category: 'Getting Started',
    duration: '28:45',
    views: 8930,
    publishDate: '2024-01-18',
    difficulty: 'Beginner',
    thumbnail: '/images/video-build.png',
    videoUrl: 'https://youtube.com/watch?v=demo2',
    isNew: false
  },
  {
    id: 'advanced-customization',
    title: 'Advanced Customization Techniques',
    description: 'Deep dive into customizing generated code and adding complex business logic.',
    category: 'Advanced Features',
    duration: '45:12',
    views: 5240,
    publishDate: '2024-01-22',
    difficulty: 'Advanced',
    thumbnail: '/images/video-advanced.png',
    videoUrl: 'https://youtube.com/watch?v=demo3',
    isPremium: true
  },
  {
    id: 'ai-agents-explained',
    title: 'Understanding AI Agents Architecture',
    description: 'How our 12 specialized AI agents collaborate to generate production-ready code.',
    category: 'Technical Deep Dive',
    duration: '52:18',
    views: 12680,
    publishDate: '2024-01-25',
    difficulty: 'Intermediate',
    thumbnail: '/images/video-agents.png',
    videoUrl: 'https://youtube.com/watch?v=demo4'
  },
  {
    id: 'saas-case-study',
    title: 'Building a SaaS App: Complete Walkthrough',
    description: 'Step-by-step guide to building a subscription-based SaaS application.',
    category: 'Use Cases',
    duration: '1:15:30',
    views: 7820,
    publishDate: '2024-01-28',
    difficulty: 'Intermediate',
    thumbnail: '/images/video-saas.png',
    videoUrl: 'https://youtube.com/watch?v=demo5',
    isNew: true
  },
  {
    id: 'enterprise-deployment',
    title: 'Enterprise Deployment and Security',
    description: 'Best practices for deploying Happy Llama generated apps in enterprise environments.',
    category: 'Technical Deep Dive',
    duration: '38:42',
    views: 3250,
    publishDate: '2024-02-01',
    difficulty: 'Advanced',
    thumbnail: '/images/video-enterprise.png',
    videoUrl: 'https://youtube.com/watch?v=demo6',
    isPremium: true
  },
  {
    id: 'mobile-app-creation',
    title: 'Creating Mobile Apps with Happy Llama',
    description: 'Learn how to generate React Native apps that work across iOS and Android.',
    category: 'Use Cases',
    duration: '33:15',
    views: 9150,
    publishDate: '2024-02-05',
    difficulty: 'Intermediate',
    thumbnail: '/images/video-mobile.png',
    videoUrl: 'https://youtube.com/watch?v=demo7',
    isNew: true
  },
  {
    id: 'debugging-troubleshooting',
    title: 'Debugging and Troubleshooting Guide',
    description: 'Common issues and how to resolve them when building with Happy Llama.',
    category: 'Getting Started',
    duration: '24:38',
    views: 6420,
    publishDate: '2024-02-08',
    difficulty: 'Beginner',
    thumbnail: '/images/video-debug.png',
    videoUrl: 'https://youtube.com/watch?v=demo8'
  }
];

const categoryColors = {
  'Getting Started': 'bg-green-100 text-green-800',
  'Advanced Features': 'bg-purple-100 text-purple-800',
  'Use Cases': 'bg-blue-100 text-blue-800',
  'Technical Deep Dive': 'bg-red-100 text-red-800'
};

const difficultyColors = {
  'Beginner': 'bg-green-100 text-green-800',
  'Intermediate': 'bg-yellow-100 text-yellow-800', 
  'Advanced': 'bg-red-100 text-red-800'
};

export default function VideosPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [showVideoModal, setShowVideoModal] = useState<Video | null>(null);

  // Filter videos
  const filteredVideos = videos.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         video.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || video.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'All' || video.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const categories = ['All', ...Array.from(new Set(videos.map(v => v.category)))];
  const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  const handlePlayVideo = (video: Video) => {
    if (video.isPremium) {
      alert('This is a premium video. Upgrade to Pro to access premium content.');
      return;
    }
    setShowVideoModal(video);
  };

  const formatViews = (views: number) => {
    if (views >= 1000000) return (views / 1000000).toFixed(1) + 'M';
    if (views >= 1000) return (views / 1000).toFixed(1) + 'K';
    return views.toString();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="container mx-auto px-4 py-16">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Video Library
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Learn how to build amazing applications with Happy Llama through our comprehensive video tutorials.
            </p>
            
            {/* Stats */}
            <div className="flex justify-center space-x-8 text-center">
              <div>
                <div className="text-2xl font-bold text-purple-600">{videos.length}</div>
                <div className="text-gray-500">Videos</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {Math.floor(videos.reduce((sum, v) => sum + parseFloat(v.duration.split(':')[0]) * 60 + parseFloat(v.duration.split(':')[1]), 0) / 60)}h
                </div>
                <div className="text-gray-500">Content</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {formatViews(videos.reduce((sum, v) => sum + v.views, 0))}
                </div>
                <div className="text-gray-500">Views</div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="grid md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search videos..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <select
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
                  >
                    {difficulties.map(difficulty => (
                      <option key={difficulty} value={difficulty}>{difficulty}</option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Videos Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVideos.map((video) => (
              <Card key={video.id} className="group hover:shadow-lg transition-shadow overflow-hidden">
                <div className="relative">
                  {/* Video Thumbnail */}
                  <div className="h-48 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center relative overflow-hidden">
                    <VideoCameraIcon className="h-16 w-16 text-gray-400" />
                    
                    {/* Play Button Overlay */}
                    <div 
                      className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      onClick={() => handlePlayVideo(video)}
                    >
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                        <PlayIcon className="h-8 w-8 text-gray-800 ml-1" />
                      </div>
                    </div>
                    
                    {/* Duration */}
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                      {video.duration}
                    </div>
                    
                    {/* Badges */}
                    <div className="absolute top-2 left-2 flex space-x-1">
                      {video.isNew && (
                        <Badge className="bg-green-500">New</Badge>
                      )}
                      {video.isPremium && (
                        <Badge className="bg-yellow-500">Premium</Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg leading-tight mb-2">{video.title}</CardTitle>
                      <div className="flex flex-wrap gap-2 mb-2">
                        <Badge className={categoryColors[video.category]}>
                          {video.category}
                        </Badge>
                        <Badge className={difficultyColors[video.difficulty]} variant="outline">
                          {video.difficulty}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <CardDescription className="mb-4">
                    {video.description}
                  </CardDescription>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <EyeIcon className="h-4 w-4 mr-1" />
                        {formatViews(video.views)}
                      </div>
                      <div className="flex items-center">
                        <CalendarIcon className="h-4 w-4 mr-1" />
                        {formatDate(video.publishDate)}
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full" 
                    onClick={() => handlePlayVideo(video)}
                    disabled={video.isPremium}
                  >
                    <PlayIcon className="h-4 w-4 mr-2" />
                    {video.isPremium ? 'Upgrade for Premium' : 'Watch Video'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredVideos.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <VideoCameraIcon className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                No videos found
              </h3>
              <p className="text-gray-500">
                Try adjusting your search criteria or browse all videos.
              </p>
            </div>
          )}
        </div>

        {/* Video Player Modal */}
        {showVideoModal && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <div className="flex justify-between items-center p-4 border-b">
                <h3 className="text-lg font-semibold">{showVideoModal.title}</h3>
                <Button variant="ghost" onClick={() => setShowVideoModal(null)}>
                  ✕
                </Button>
              </div>
              
              {/* Video Player Placeholder */}
              <div className="aspect-video bg-gray-900 flex items-center justify-center">
                <div className="text-center text-white">
                  <VideoCameraIcon className="h-16 w-16 mx-auto mb-4" />
                  <p>Video Player</p>
                  <p className="text-sm opacity-75">Duration: {showVideoModal.duration}</p>
                  <Button className="mt-4" onClick={() => setShowVideoModal(null)}>
                    Close Player
                  </Button>
                </div>
              </div>
              
              <div className="p-4">
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-gray-600">{showVideoModal.description}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}