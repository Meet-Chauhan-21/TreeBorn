export interface CountryData {
  name: string;
  code: string;
  states: {
    name: string;
    districts: string[];
  }[];
}

export const locationData: CountryData[] = [
  {
    name: 'India',
    code: 'IN',
    states: [
      {
        name: 'Gujarat',
        districts: [
          'Ahmedabad',
          'Amreli',
          'Anand',
          'Banaskantha',
          'Bharuch',
          'Bhavnagar',
          'Dahod',
          'Gandhinagar',
          'Jamnagar',
          'Junagadh',
          'Kheda',
          'Kutch',
          'Mehsana',
          'Morbi',
          'Narmada',
          'Navsari',
          'Panchmahal',
          'Patan',
          'Porbandar',
          'Rajkot',
          'Sabarkantha',
          'Surat',
          'Surendranagar',
          'Tapi',
          'Vadodara',
          'Valsad'
        ]
      },
      {
        name: 'Maharashtra',
        districts: [
          'Mumbai City',
          'Mumbai Suburban',
          'Thane',
          'Pune',
          'Nagpur',
          'Nashik',
          'Aurangabad',
          'Solapur',
          'Amravati',
          'Kolhapur',
          'Satara',
          'Sangli',
          'Jalgaon',
          'Nanded',
          'Raigad'
        ]
      },
      {
        name: 'Rajasthan',
        districts: [
          'Jaipur',
          'Jodhpur',
          'Udaipur',
          'Kota',
          'Ajmer',
          'Bikaner',
          'Alwar',
          'Bhilwara',
          'Sikar',
          'Sri Ganganagar',
          'Bharatpur',
          'Pali'
        ]
      },
      {
        name: 'Delhi',
        districts: [
          'New Delhi',
          'Central Delhi',
          'North Delhi',
          'South Delhi',
          'East Delhi',
          'West Delhi',
          'North East Delhi',
          'North West Delhi',
          'South East Delhi',
          'South West Delhi',
          'Shahdara'
        ]
      },
      {
        name: 'Karnataka',
        districts: [
          'Bengaluru Urban',
          'Bengaluru Rural',
          'Mysuru',
          'Belagavi',
          'Dharwad',
          'Mangaluru (Dakshina Kannada)',
          'Kalaburagi',
          'Davangere',
          'Ballari',
          'Tumakuru',
          'Shivamogga'
        ]
      },
      {
        name: 'Uttar Pradesh',
        districts: [
          'Lucknow',
          'Kanpur Nagar',
          'Gautam Buddha Nagar (Noida)',
          'Ghaziabad',
          'Agra',
          'Varanasi',
          'Prayagraj (Allahabad)',
          'Meerut',
          'Bareilly',
          'Aligarh',
          'Gorakhpur',
          'Jhansi'
        ]
      }
    ]
  },
  {
    name: 'United States',
    code: 'US',
    states: [
      {
        name: 'California',
        districts: [
          'Los Angeles County',
          'San Diego County',
          'Orange County',
          'Santa Clara County',
          'San Francisco County',
          'Alameda County',
          'Sacramento County'
        ]
      },
      {
        name: 'New York',
        districts: [
          'New York County (Manhattan)',
          'Kings County (Brooklyn)',
          'Queens County',
          'Bronx County',
          'Richmond County (Staten Island)',
          'Nassau County',
          'Suffolk County'
        ]
      },
      {
        name: 'Texas',
        districts: [
          'Harris County (Houston)',
          'Dallas County',
          'Tarrant County (Fort Worth)',
          'Bexar County (San Antonio)',
          'Travis County (Austin)'
        ]
      },
      {
        name: 'Florida',
        districts: [
          'Miami-Dade County',
          'Broward County (Fort Lauderdale)',
          'Palm Beach County',
          'Hillsborough County (Tampa)',
          'Orange County (Orlando)'
        ]
      }
    ]
  },
  {
    name: 'United Kingdom',
    code: 'GB',
    states: [
      {
        name: 'England',
        districts: [
          'Greater London',
          'Greater Manchester',
          'West Midlands',
          'West Yorkshire',
          'Merseyside',
          'Tyne and Wear'
        ]
      },
      {
        name: 'Scotland',
        districts: [
          'Glasgow City',
          'City of Edinburgh',
          'Fife',
          'North Lanarkshire',
          'South Lanarkshire'
        ]
      }
    ]
  },
  {
    name: 'Canada',
    code: 'CA',
    states: [
      {
        name: 'Ontario',
        districts: [
          'Toronto Region',
          'Ottawa Region',
          'Peel Region',
          'York Region',
          'Hamilton Region'
        ]
      },
      {
        name: 'Quebec',
        districts: [
          'Montreal Region',
          'Quebec City Region',
          'Laval Region',
          'Gatineau Region'
        ]
      }
    ]
  }
];

export default locationData;
