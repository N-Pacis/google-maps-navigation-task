# Real Time Google Maps Directions

Real Time Google Maps Directions is a web application designed for bus drivers, providing them with real-time directions and stop information. It's built using React and the Google Maps JavaScript API. With this tool, bus drivers can efficiently navigate their routes, receiving live updates on directions and stops based on their current location and predefined destinations. It offers a user-friendly interface, making it convenient for drivers to access essential information while on the road.

The app has predefined stop points, and it uses the current user's location as the origin and the last item in the predefined stop points as the destination. The app then feeds all the stop points, origin, and destination to the directions service API to calculate a suitable route for the driver. The directions service also calculates ETA and distance. We then feed the coordinates of the stop points to a reverse geocode API to get human-readable names for efficient display. Finally, we display all stop points and their respective ETA and distance.

## Features

- Displays real-time directions from the user's current location to predefined stops.
- Updates directions and stop information in real-time.
- Shows distance and estimated time of arrival (ETA) for each stop.

## Technologies Used

- React
- Google Maps JavaScript API
- React Google Maps API

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/N-Pacis/google-maps-navigation-task.git
   ```

2. Install dependencies:
    ```bash
    npm install
    ```

3. Set up your Google Maps API key in the .env file:
    ```bash
    VITE_MAP_API_KEY=your-google-maps-api-key
    ```
    
4. Start the development server:
    ```bash
    npm run dev
    ```

## Usage

Allow the application to access your current location.
View the real-time directions and stop information on the map and in the side panel.

## Contributing

Contributions are welcome! Please create a new branch and submit a pull request for any enhancements or bug fixes.

## License
This project is licensed under the MIT License.

Done with ❤️ by Pacis Nkubito.