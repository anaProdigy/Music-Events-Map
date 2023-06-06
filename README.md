## 🎶🎤🎸🎶 ??? Cool Title ??? 🎶🎤🎸🎶

Lighthouse Labs Wiki Maps midterm intro...


## Getting Started

1. [Create](https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-repository-from-a-template) a new repository using this repository as a template.
2. Clone your repository onto your local device.
3. Create the `.env` by using `.env.example` as a reference: `cp .env.example .env`.
4. Update the `.env` file with your correct local information.
5. Install dependencies using `npm i`.
6. Fix to binaries for sass: `npm rebuild node-sass`.
7. Reset database: `npm run db:reset`.
8. Run the node server with `npm start` command from within the project directory. The app will be served at <http://localhost:8080/>.
9. Click `Log In`/`Sign Out` from the nav bar to toggle between an authenticated user and the logged out state. 

## Dependencies

- Node 10.x or above
- NPM 5.x or above
- PG 6.x
- Chalk
- Cookie-Parser
- Dotenv
- EJS
- Express
- Morgan
- PG
- Sass

## Technology

This full stack project focused on developing an API-based web page integrating complex SQL queries from a node-postgres database, complete with a user-frienly UI/UX design.  

The back-end ... 

THe front-end (boostrap, font awesome, daysjs, etc)

## Features

#### Logged-out State:
- Click markers on the map to view music event information in a popup; click the `. . .` to view additional information and links pertaining to an event

#### Authenticated User:
- Click anywhere on the map to add a new event marker and click `Yes` in the popup to toggle the new event form; choose `No`, `x`, or click anywhere else on the map to place the marker elsewhere
- Fill out the new event form and `Add` to add the event to the database
- Use the search bar to find a location, city, etc, either to explore upcoming events, or to better place your own event marker
- View your created events on the dropdown `My Events` where you can `Edit` and/or `Delete` any of your events; `Edit` will prepopulate the current event information on the edit form
- Add an event to the `Favourites` dropdown by clicking the `🤍` in the event popup, at which point it will turn `💗`, indicating it has been added
- `Remove` an event from `Favourites` within the dropdown

## Final Product
![](docs/user_profile.gif)
