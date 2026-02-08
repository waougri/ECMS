
export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  category: 'cleaning' | 'maintenance' | 'improvement';
  icon: string;
}

export interface GalleryImage {
  url: string;
  caption: string;
}

export interface Testimonial {
  author: string;
  role: string;
  content: string;
  location: string;
  rating: number;
  date: string;
}

export interface CrewMember {
  id: string;
  name: string;
  role: string;
  imageUrl: string;
}
