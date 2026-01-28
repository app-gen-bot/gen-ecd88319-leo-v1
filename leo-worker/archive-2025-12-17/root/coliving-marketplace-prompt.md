# Co-Living Marketplace Application

Build a co-living marketplace platform - similar to Airbnb but focused on long-term room rentals and shared living spaces.

## Core Concept

Property owners ("hosts") rent out spare rooms, in-law units, or other living spaces in their properties for long-term stays (typically 3+ months). Tenants ("guests") search for affordable, community-oriented living arrangements.

## Key Features

### For Hosts (Property Owners)
- Create and manage property listings with multiple rooms/units
- Upload photos, set amenities, house rules, and pricing
- Define lease terms (minimum stay, deposit requirements, utilities included)
- Review tenant applications and backgrounds
- Manage bookings and leases
- Message with potential and current tenants
- Rate and review tenants after their stay

### For Guests (Tenants)
- Search for rooms/units by location, price, amenities, and availability
- View detailed property information, photos, and host profiles
- Submit rental applications with profile, employment, and references
- Message hosts with questions
- Book approved listings with lease agreements
- Pay rent and deposits through the platform
- Rate and review properties and hosts

### Core Workflows

1. **Listing Creation**: Host creates detailed property listing with rooms, photos, pricing, and availability
2. **Search & Discovery**: Guest searches by location/filters, views listings, saves favorites
3. **Application Process**: Guest submits application → Host reviews → Host approves/rejects
4. **Booking & Lease**: Approved application → Guest pays deposit → Lease agreement generated → Move-in date confirmed
5. **Ongoing Tenancy**: Monthly rent payments, messaging, maintenance requests
6. **Move-Out**: Notice period, final inspection, deposit return, mutual reviews

## Essential Pages

- **Home/Landing**: Search bar, featured listings, how it works
- **Search Results**: Filterable list of available properties
- **Property Detail**: Full listing info, photos, amenities, availability calendar
- **Host Dashboard**: Manage listings, view applications, track income
- **Guest Dashboard**: Saved searches, applications status, current/past bookings
- **Profile Management**: Edit user profile, verification, references
- **Messages**: In-app messaging between hosts and guests
- **Application Form**: Detailed tenant application with employment and references
- **Booking/Lease**: Payment, lease agreement, move-in details
- **Reviews**: Write and manage reviews for properties and users

## Data Model Considerations

- **Users**: Hosts and Guests (can be both roles)
- **Properties**: Address, description, house rules, host relationship
- **Rooms/Units**: Within properties, individual listings with pricing
- **Applications**: Guest applications with status (pending, approved, rejected)
- **Bookings/Leases**: Active rental agreements with dates and terms
- **Messages**: Conversations between users
- **Reviews**: Bidirectional ratings between hosts and guests
- **Payments**: Deposits, monthly rent, payment history

## Design Priorities

- **Trust & Safety**: Verification badges, reviews, secure payments
- **Mobile-Friendly**: Responsive design for on-the-go searching
- **Clear Communication**: Easy messaging and notification system
- **Visual Appeal**: High-quality photo galleries, clean property cards
- **Streamlined Process**: Simple application and booking flow

## Success Metrics

- Number of active listings
- Application-to-booking conversion rate
- Average length of stay
- Host and guest satisfaction ratings
- Platform revenue from transaction fees

Build a complete, production-ready MVP that handles the core listing, search, application, and booking workflows with a clean, trustworthy user experience.
