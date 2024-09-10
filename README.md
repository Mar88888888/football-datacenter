# Football DataCenter

Football DataCenter is a comprehensive web application that centralizes and displays various football-related data. Whether you're looking to explore detailed team information or check out the latest competitions, Football DataCenter brings all this information into one user-friendly platform.

## Overview

The application pulls real-time data from reliable sources like SofaScore and offers users up-to-date information about:

- Football teams and their details.
- Competitions including major football leagues and tournaments.
- Fixtures, match results, and more.

### Key Features

- **Team Information:**
  - Browse through a list of football teams with detailed profiles for each team.
  - View essential information such as the team's stadium, foundation year, country, and roster.
  - Teams are fetched dynamically, ensuring that users always get the most up-to-date data.

- **Competitions:**
  - Displays an organized list of ongoing and upcoming football competitions.
  - Provides detailed insights on leagues, cups, and international tournaments.

- **Interactive User Interface:**
  - The front-end is designed to be minimalistic yet highly functional, with blue color scheme.
  - Users can navigate between different sections such as teams, competitions, and fixtures.

- **Scraping Real-Time Data:**
  - Football DataCenter leverages web scraping to keep data fresh and updated, ensuring users always have access to the latest football stats and information.
  - Data is gathered directly from SofaScore, a leading football statistics platform.

- **User Authentication:**
  - The app includes user login and registration functionality, allowing users to create accounts and access personalized data.
  - Users' sessions are managed using secure session-based authentication.

### Demo

#### Home Page

The Home Page gives users a broad overview of the current football landscape. Users can explore various teams, competitions, and access detailed statistics.

![Home Page](https://github.com/Mar88888888/football-datacenter/blob/main/Client/screenshots/home-page.png)

#### Team Page

Clicking on a team from the team list will take you to a detailed **Team Page**. 

![All teams Page](https://github.com/Mar88888888/football-datacenter/blob/main/Client/screenshots/all-teams.png)


Here you can view the team's basic info (name, stadium, city) as well as competitions participating and squad details.

![Team Page](https://github.com/Mar88888888/football-datacenter/blob/main/Client/screenshots/team-page-1.png)
![Team Page](https://github.com/Mar88888888/football-datacenter/blob/main/Client/screenshots/team-page-2.png)

#### Competitions Page

The **Competitions Page** displays all major football tournaments and leagues. Users can select any competition to view additional details such as participating teams, match schedules, and standings.

![All competitions Page](https://github.com/Mar88888888/football-datacenter/blob/main/Client/screenshots/all-competitions.png)
![Competition Page](https://github.com/Mar88888888/football-datacenter/blob/main/Client/screenshots/competition-1.png)
![Competition Page](https://github.com/Mar88888888/football-datacenter/blob/main/Client/screenshots/competition-2.png)


### How It Works

1. **Data Scraping:**
   - The backend scrapes real-time football data from SofaScore’s API and other sources.
   - This data includes team rosters, competition details, and fixture results, which are then stored and updated in the app’s database.

2. **Dynamic API:** 
   - The app is built with a dynamic REST API, allowing the front-end to request the latest information from the backend. 
   - This ensures that the displayed data remains current and relevant.

3. **User Interactions:**
   - Users can browse football data freely but must authenticate to access certain features like managing personal preferences or following specific teams.
   - All interactions, from logging in to browsing competitions, happen seamlessly through the modern React interface.


## More Screenshots

Authorization pages to create or log into user's account.

![Log In](https://github.com/Mar88888888/football-datacenter/blob/main/Client/screenshots/log-in.png) 

![Sign Up](https://github.com/Mar88888888/football-datacenter/blob/main/Client/screenshots/sign-up.png) 


User's favourites page, when he can see all the favourite teams and competitions and easily navigate to their pages.

![User Favourites](https://github.com/Mar88888888/football-datacenter/blob/main/Client/screenshots/user-favourites.png)


## Contact

Developed by [Mar88888888](https://github.com/Mar88888888)  
Project Repository: [Football DataCenter](https://github.com/Mar88888888/football-datacenter)
