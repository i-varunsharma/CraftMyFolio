import { NextResponse } from 'next/server';

const mockTemplates = [
  {
    id: 1,
    name: "Modern Developer",
    description: "Clean, modern portfolio with smooth animations",
    image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=250&fit=crop",
    tags: ["React", "Tailwind", "Framer Motion"],
    category: "Developer",
    stars: 1250,
    downloads: 5600,
    preview: "https://modern-dev-template.vercel.app",
    github: "https://github.com/templates/modern-dev"
  },
  {
    id: 2,
    name: "Creative Designer",
    description: "Vibrant portfolio showcasing creative work",
    image: "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=400&h=250&fit=crop",
    tags: ["Vue", "SCSS", "Three.js"],
    category: "Designer",
    stars: 890,
    downloads: 3200,
    preview: "https://creative-designer-template.vercel.app",
    github: "https://github.com/templates/creative-designer"
  },
  {
    id: 3,
    name: "Minimal Professional",
    description: "Clean, minimal design for professionals",
    image: "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=400&h=250&fit=crop",
    tags: ["HTML", "CSS", "JavaScript"],
    category: "Professional",
    stars: 2100,
    downloads: 8900,
    preview: "https://minimal-pro-template.vercel.app",
    github: "https://github.com/templates/minimal-pro"
  }
];

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'stars';
    
    let filteredTemplates = [...mockTemplates];
    
    // Filter by category
    if (category && category !== 'all') {
      filteredTemplates = filteredTemplates.filter(t => 
        t.category.toLowerCase() === category.toLowerCase()
      );
    }
    
    // Filter by search
    if (search) {
      filteredTemplates = filteredTemplates.filter(t =>
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.description.toLowerCase().includes(search.toLowerCase()) ||
        t.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
      );
    }
    
    // Sort templates
    filteredTemplates.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'downloads') return b.downloads - a.downloads;
      return b.stars - a.stars; // default: stars
    });
    
    return NextResponse.json({
      templates: filteredTemplates,
      total: filteredTemplates.length
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}