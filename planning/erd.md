- Users
id, name, email, *password*

- User_Events (favourites)
id, user_id, music_event_id

- Music events/live music - Map Markers
id, creator_id(user_id), name, description, start_date, end_date, venue, street, city, province, country, postal code, event_link_URL, event_thumbnail_url (flyer/poster)

- **edit/delete requests table
id, user_requested_id (user_id), creator_id(of that map, user_id), request_content, implemented (boolean)

[ERD](/docs/erd.png)
