
import {ServiceItem, Testimonial, GalleryImage, CrewMember} from '../east-coast-maintenance-service-(ecms)(2)/types';

export const SERVICES: ServiceItem[] = [
  {
    id: 'comm-clean',
    title: 'Commercial Office Cleaning',
    description: 'We treat your office like our own home. Thorough, reliable, and consistent cleaning for your team.',
    category: 'cleaning',
    icon: '✨'
  },
  {
    id: 'med-clean',
    title: 'Medical Facility Sanitation',
    description: 'Critical hygiene for our local clinics. We live here, so we care about the health of our neighbors.',
    category: 'cleaning',
    icon: '🧼'
  },
  {
    id: 'landscaping',
    title: 'Landscape & Grounds Care',
    description: 'Keeping Wilmington beautiful, one lawn at a time. From trimming to seasonal grounds management.',
    category: 'maintenance',
    icon: '🌿'
  },
  {
    id: 'repairs',
    title: 'Improvements & Repairs',
    description: 'Our handymen and carpenters are your neighbors. Painting, flooring, and small builds handled with care.',
    category: 'improvement',
    icon: '🪵'
  },
  {
    id: 'restroom',
    title: 'Restroom Sanitation',
    description: 'Deep cleaning that goes beyond the surface. We tackle the tough jobs so you don\'t have to.',
    category: 'cleaning',
    icon: '🚿'
  },
  {
    id: 'lighting',
    title: 'Facility Maintenance',
    description: 'Filter swaps, lighting replacement, and system checks. Total support for local business spaces.',
    category: 'maintenance',
    icon: '🔧'
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    author: "Austin Foxworthy",
    role: "Local Resident",
    content: "Vicky does a great job cleaning my apartment. It is so nice to come home to a clean space after working all day! Highly recommend. Thank you!",
    location: "Wilmington, NC",
    rating: 5,
    date: "6 months ago"
  },
  {
    author: "Isaiah Brown",
    role: "Business Partner",
    content: "Owner was courteous and cleaning service was professional.",
    location: "New Hanover County",
    rating: 5,
    date: "1 year ago"
  },
  {
    author: "Aj Konegen",
    role: "Client",
    content: "Excellent service and professionalism. They truly care about the details.",
    location: "Wilmington, NC",
    rating: 5,
    date: "2 weeks ago"
  },
  {
    author: "Ryan Smith",
    role: "Long-time Client",
    content: "Consistent, high-quality maintenance for our facilities over the years.",
    location: "Wilmington, NC",
    rating: 5,
    date: "5 years ago"
  }
];

export const GALLERY_IMAGES: GalleryImage[] = [
  { url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=1200', caption: 'Wilmington Medical Center - Deep Cleaned' },
  { url: 'https://images.unsplash.com/photo-1513161455079-7dc1de15ef3e?auto=format&fit=crop&q=80&w=1200', caption: 'Warm Lobby Maintenance' },
  { url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200', caption: 'Polished Hallways' },
  { url: 'https://media.istockphoto.com/id/2175336460/photo/caution-wet-floor.jpg?s=612x612&w=0&k=20&c=zfZxCkRNeN9uducsNbXTfIEm9TurK_h5Y6A8bpJ-RrA=', caption: 'Clean Industrial Floors' }
];

export const LANDSCAPING_IMAGES: GalleryImage[] = [
  { url: 'https://media.istockphoto.com/id/1347784849/photo/scenic-view-of-a-beautiful-landscape-garden-with-a-green-mowed-lawn.webp?b=1&s=612x612&w=0&k=20&c=NXYgs2-QGp5HMxVdi2mrR-1AcNvteyVAPa4638lZSpI=', caption: 'Lumina Station Manicured Gardens' },
  { url: 'https://static.vecteezy.com/system/resources/thumbnails/024/629/941/small/landscape-garden-maintenance-professional-at-work-photo.jpg', caption: 'Wilmington Coastal Grounds' },
  { url: 'https://media.istockphoto.com/id/1543476902/photo/gardener-cuts-a-boxwood-with-a-hedge-trimmer.jpg?s=612x612&w=0&k=20&c=9A6mgtnzFocBD6TRauxYjOaZJeZuBIsFgtBT-OIe-9E=', caption: 'Pristine Hedge Trimming' },
  { url: 'https://media.istockphoto.com/id/106380084/photo/beautiful-multicolored-flowerbed-on-green-lawn.jpg?s=612x612&w=0&k=20&c=S_sZiUvvSDSW3F82ZoFlFR5N4tUhSpXam0OvEKegO1E=', caption: 'Seasonal Flowerbeds' }
];


export const CREW: CrewMember[] = [
  {
    id: '1',
    name: 'Vicky Miller',
    role: 'Lead Cleaning Specialist',
    imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: '2',
    name: 'Marcus Chen',
    role: 'Grounds Manager',
    imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: '3',
    name: 'Sarah Thompson',
    role: 'Facility Maintenance',
    imageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=400'
  }
];

export const BUSINESS_INFO = {
  phone: '(910) 256-9081',
  address: '1908 Eastwood Rd STE 331',
  subAddress: 'Located in Lumina Station',
  cityStateZip: 'Wilmington, NC 28403',
  since: '1974',
  name: 'East Coast Maintenance Service',
  hours: [
    { day: 'Monday', time: '9 AM – 5 PM' },
    { day: 'Tuesday', time: '9 AM – 5 PM' },
    { day: 'Wednesday', time: '9 AM – 5 PM' },
    { day: 'Thursday', time: '9 AM – 5 PM' },
    { day: 'Friday', time: '9 AM – 5 PM' },
    { day: 'Sat & Sun', time: 'Closed' }
  ]
};