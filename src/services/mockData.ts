import { Place, Hotel } from '../types';

// Let's create a mock dataset for New York City
export const MOCK_HOTELS: Hotel[] = [
  {
    dayIndex: 0,
    name: 'The Plaza',
    address: '768 5th Ave, New York, NY 10019',
    lat: 40.7644,
    lng: -73.9744,
  },
  {
    dayIndex: 1,
    name: 'New York Marriott Marquis',
    address: '1535 Broadway, New York, NY 10036',
    lat: 40.7586,
    lng: -73.9862,
  }
];

export const MOCK_PLACES: Omit<Place, 'dayIndex' | 'orderInDay'>[] = [
  {
    id: 'm1',
    name: 'Central Park',
    address: 'New York, NY',
    lat: 40.7812,
    lng: -73.9665,
    description: 'Vast urban park with walking paths, a zoo, and scenic spots.',
    descriptionSource: 'mock',
  },
  {
    id: 'm2',
    name: 'Times Square',
    address: 'Manhattan, NY 10036',
    lat: 40.7580,
    lng: -73.9855,
    description: 'Bustling destination in the heart of the Theater District known for bright lights.',
    descriptionSource: 'mock',
  },
  {
    id: 'm3',
    name: 'Empire State Building',
    address: '20 W 34th St, New York, NY 10001',
    lat: 40.7484,
    lng: -73.9857,
    description: 'Iconic art deco skyscraper offering observation decks and city views.',
    descriptionSource: 'mock',
  },
  {
    id: 'm4',
    name: 'Statue of Liberty',
    address: 'New York, NY 10004',
    lat: 40.6892,
    lng: -74.0445,
    description: 'Colossal copper statue on Liberty Island, a symbol of freedom.',
    descriptionSource: 'mock',
  },
  {
    id: 'm5',
    name: 'The Metropolitan Museum of Art',
    address: '1000 5th Ave, New York, NY 10028',
    lat: 40.7794,
    lng: -73.9632,
    description: 'One of the worlds largest and finest art museums.',
    descriptionSource: 'mock',
  },
  {
    id: 'm6',
    name: 'Brooklyn Bridge',
    address: 'Brooklyn Bridge, New York, NY 10038',
    lat: 40.7061,
    lng: -73.9969,
    description: 'Historic suspension bridge connecting Manhattan and Brooklyn.',
    descriptionSource: 'mock',
  },
  {
    id: 'm7',
    name: 'The High Line',
    address: 'New York, NY 10011',
    lat: 40.7480,
    lng: -74.0048,
    description: 'Elevated linear park, greenway and rail trail created on a former New York Central Railroad spur.',
    descriptionSource: 'mock',
  }
];
