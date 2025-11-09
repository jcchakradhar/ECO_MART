# this is a e commerce website ,which is commited to sustainability
### **Complete Guide to Running The Full-Stack E-commerce Project**

To run your application, you will need **three separate terminal windows** open simultaneously: one for the Node.js backend, one for the React frontend, and one for the Python Flask service.

---

### **Step 1: Run the Backend (Node.js Server)**

1. Open your **first** terminal (e.g., PowerShell, Command Prompt, or a VS Code terminal).
2. Navigate to the backend project directory:
    
    ```powershell
    cd C:\\Users\\dhansukh\\Desktop\\dev\\ECO_MART\\MERN-ecommerce-backend
    
    ```
    
3. Install the required Node.js packages (you only need to do this once):
    
    ```powershell
    npm install
    
    ```
    
4. Start the backend server:
    
    ```powershell
    npm start
    
    ```
    
    You should see a message indicating the server is running, likely connected to your MongoDB database.
    
    **➡️ Leave this terminal window running.**
    

---

### **Step 2: Run the Frontend (React Application)**

1. Open a **new, second** terminal window.
2. Navigate to the frontend project directory:
    
    ```powershell
    cd C:\\Users\\dhansukh\\Desktop\\dev\\ECO_MART\\MERN-ecommerce-Frontend
    
    ```
    
3. Install the required Node.js packages (you only need to do this once):
    
    ```powershell
    npm install -- force
    
    ```
    
4. Start the frontend development server:
    
    ```powershell
    npm start
    
    ```
    
    This will likely open a new tab in your web browser at `http://localhost:3000`.
    
    **➡️ Leave this terminal window running as well.**
    

---

### **Step 3: Run the Python Service (Flask API)**

This setup needs to be done inside the `MERN-ecommerce-backend` directory.

1. Open a **third** terminal window.
2. Navigate to the backend project directory again:
    
    ```powershell
    cd C:\\Users\\dhansukh\\Desktop\\dev\\ECO_MART\\MERN-ecommerce-backend
    
    ```
    

### **A. First-Time Setup (Do this only once)**

If this is your first time setting up the Python environment, follow these sub-steps carefully.

1. **Create the `requirements.txt` file** in the `MERN-ecommerce-backend` folder and paste this content into it:
    
    ```
    flask
    flask_cors
    pymongo
    pandas
    python-dotenv
    scikit-learn
    spacy
    pyarrow
    
    ```
    
2. **Create and activate a virtual environment.** This keeps your Python packages separate from your global system.
    
    ```powershell
    # Create the virtual environment
    python -m venv .venv
    
    # Activate it
    .\\.venv\\Scripts\\Activate.ps1
    
    ```
    
    Your terminal prompt should now begin with `(.venv)`.
    
3. **Install all Python dependencies** from your requirements file:
    
    ```powershell
    pip install -r requirements.txt
    
    ```
    
4. **Download the required spaCy language model:**
    
    ```powershell
    python -m spacy download en_core_web_sm
    
    ```
    

### **B. Running the Python Server (Do this every time)**

1. Make sure you are in the correct directory and your virtual environment is active. If not, run:
    
    ```powershell
    cd C:\\Users\\dhansukh\\Desktop\\dev\\ECO_MART\\MERN-ecommerce-backend
    .\\.venv\\Scripts\\Activate.ps1
    
    ```
    
2. Start the Flask server on port `5001`:
    
    ```powershell
    flask --app app run --debug --port 5001
    
    ```
    
    You should see output indicating the Flask server is running.
    
    **➡️ Keep this third terminal running.**
    

---

### **Summary**

At this point, you should have:

1. **Terminal 1:** Running the Node.js backend.
2. **Terminal 2:** Running the React frontend.
3. **Terminal 3:** Running the Python Flask service.

Your full application is now up and running. You can access it in your browser, typically at `http://localhost:3000`.