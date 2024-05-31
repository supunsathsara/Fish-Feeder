# Fish Feeder Project 🐠

The Fish Feeder project automates the feeding of pet fish, solving common problems such as irregular feeding schedules and the need for remote management. This project integrates hardware and software components to ensure reliable and consistent feeding.

![Image 2](https://github.com/supunsathsara/Fish-Feeder/assets/67389877/7a3621a9-1a77-4968-a7a5-7e508b95f31a)

## Project Overview
The Fish Feeder system is composed of the following components:
- **NodeMCU ESP8266 Microcontroller**: Controls the hardware and communicates with the server.
- **SG90 Servo Motor**: Dispenses fish food.
- **OLED Display**: Provides local status updates.
- **Membrane Switch Keypad**: Allows manual interaction with the system.

The software stack includes:
- **Node.js Server**: Manages feeding schedules and communicates with the microcontroller.
- **React Native Mobile App**: Allows users to set schedules, initiate feeds, and monitor feeding history.
- **Firebase**: Ensures real-time data synchronization and notifications.
- **HiveMQTT Broker**: Facilitates real-time communication.

## Features
- **Flexible Feeding Schedules**
- **Manual Feeding**
- **Feeding History Monitoring**
- **Real-Time Notifications**

## Folder Structure
```plaintext
FishFeeder/
├── FishFeeder-App/
│   └── (React Native mobile app code)
├── NodeMCU-Code/
│   └── (ESP8266 code)
├── server/
│   └── (Express.js server code)
└── docs/
```

## Getting Started

### Prerequisites
- Node.js
- React Native CLI
- Firebase account
- HiveMQTT account
- Arduino IDE (for NodeMCU programming)

### Installation

1. **Clone the Repository**
    ```sh
    git clone https://github.com/yourusername/FishFeeder.git
    cd FishFeeder
    ```

2. **Install Server Dependencies**
    ```sh
    cd server
    npm install
    ```

3. **Setup Firebase**
    - Create a Firebase project and add your configuration to the server and mobile app.

4. **Install Mobile App Dependencies**
    ```sh
    cd ../FishFeeder-App
    npm install
    ```

5. **Upload Code to NodeMCU**
    - Open `NodeMCU-Code` in Arduino IDE.
    - Upload the code to your ESP8266.

### Running the Application

1. **Start the Server**
    ```sh
    cd server
    npm start
    ```

2. **Run the Mobile App**
    ```sh
    cd ../FishFeeder-App
    npx react-native run-android # For Android
    npx react-native run-ios # For iOS
    ```

3. **Interact with the System**
    - Use the mobile app to set feeding schedules and initiate manual feeds.
    - Monitor feeding history and receive notifications.

## Documentation
Detailed documentation, including the project report and presentation, can be found in the `docs` folder.

## Contributions
Contributions are welcome! Please submit a pull request or open an issue for any improvements or suggestions.

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgments
We would like to thank our instructors and peers for their support and guidance throughout this project.

---

Feel free to explore the repository and contribute to the project. Happy feeding!
