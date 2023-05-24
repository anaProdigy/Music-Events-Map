- Users
id, favourite_id, name, email, *password*

- Favourites* (separate table?)
id, user_id, [map_id, map_id, map_id]

- Maps
id, creator_id(user_id), name, longitude/latitude?, ?? 

- Music events/live music - Map Markers
id, creator_id(user_id), name, date - singular/start and end, venue, [latitude/longitude?(street, city, province, country, postal code)], event_link_URL, event_thumbnail_url (flyer/poster), is_active

- **edit/delete requests table
id, user_requested_id (user_id), creator_id(of that map, user_id), request_content, implemented (boolean)
