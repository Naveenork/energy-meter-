// /* eslint-disable no-undef */
// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import './BillCalculator.css'; // Import the updated CSS file
// import jsPDF from 'jspdf';

// function BillCalculator() {
//     // Your existing state variables...
//     const [startDate, setStartDate] = useState('');
//     const [endDate, setEndDate] = useState('');
//     const [totalEnergy, setTotalEnergy] = useState('');
//     const [totalBill, setTotalBill] = useState('');
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState('');
//     const [latestReading, setLatestReading] = useState({
//         voltage: 0,
//         current: 0,
//         power: 0,
//         timestamp: ''
//     });
//     const [darkMode, setDarkMode] = useState(false); // Theme state

//     // Fetch latest reading every 5 seconds
//     const fetchLatestReading = async () => {
//         try {
//             const response = await axios.get('http://localhost:3000/latest-reading');
//             setLatestReading(response.data);
//         } catch (error) {
//             console.error('Error fetching latest reading:', error);
//         }
//     };

//     useEffect(() => {
//         const interval = setInterval(fetchLatestReading, 5000);
//         return () => clearInterval(interval);
//     }, []);

//     // Function to calculate the bill
//     const calculateBill = async () => {
//         setLoading(true);
//         setError('');
//         try {
//             const response = await axios.get('http://localhost:3000/calculate-bill', {
//                 params: {
//                     start: startDate,
//                     end: endDate
//                 }
//             });
//             setTotalEnergy(response.data.totalEnergy);
//             setTotalBill(response.data.totalBill);
//         } catch (error) {
//             setError('Error fetching bill. Please check your server connection.');
//         } finally {
//             setLoading(false);
//         }
//     };

//     // Enhanced PDF generation function

// const downloadPDF = () => {
//     const doc = new jsPDF();
//     const pageWidth = doc.internal.pageSize.width;
//     const blueColor = [0, 51, 102];
    
//     // Generate a dynamic bill number starting with 71172101
//     const billNumber = `711721${Math.floor(Math.random() * 1000) + 100}`;

//     // Set Header
//     doc.setFont("Helvetica", "bold");
//     doc.setFontSize(16);
//     doc.setTextColor(...blueColor);
//     doc.text("Smart Energy Meter Bill", pageWidth / 2, 20, { align: "center" });

//     // Customer Information Section
//     doc.setFont("Helvetica", "normal");
//     doc.setFontSize(12);
//     doc.setTextColor(0, 0, 0);  // Black text color for information
//     doc.text(`Customer Name: Naveenkumar`, 10, 30);
//     doc.text(`Mobile Number: 9345611558`, 10, 40);
//     doc.text(`Address: No 24, Marutham Nagar, Sathy Main Road,`, 10, 50);
//     doc.text(`Kalapatti Pirivu, Coimbatore, Tamil Nadu - 641035`, 10, 60);
//     doc.text(`Smart Meter ID: 40340727`, 10, 70);
//     doc.text(`Bill Number: ${billNumber}`, 10, 80);

//     // Billing Period
//     doc.text(`Start Date: ${startDate}`, pageWidth - 80, 30);
//     doc.text(`End Date: ${endDate}`, pageWidth - 80, 40);

//     // Table Header
//     doc.setTextColor(...blueColor);
//     doc.setFontSize(12);
//     doc.setFont("Helvetica", "bold");
//     doc.text("Billing Summary", 10, 95);
//     doc.setLineWidth(0.5);
//     doc.setDrawColor(...blueColor);
//     doc.line(10, 98, pageWidth - 10, 98);  // Blue line separator

//     // Table Content
//     doc.setTextColor(0, 0, 0);
//     doc.setFontSize(10);
//     const tableStartY = 105;

//     const tableData = [
//         ["Description", "Details"],
//         ["Total Energy Consumed", `${totalEnergy}`],
//         ["Total Bill Amount", `${totalBill}`],
//     ];

//     tableData.forEach((row, index) => {
//         const rowY = tableStartY + index * 10;
//         doc.text(row[0], 10, rowY);
//         doc.text(row[1], pageWidth - 70, rowY);
//     });

//     // Footer
//     doc.setTextColor(...blueColor);
//     doc.setFontSize(10);
//     doc.text("Thank you for using Smart Energy Meter!", 10, tableStartY + 40);
//     doc.text("Please pay by the due date to avoid penalties.", 10, tableStartY + 50);

//     // Save the PDF
//     doc.save('Electricity_Bill.pdf');
// };

//     // Send SMS functionality
//     const sendSMS = async () => {
//         try {
//             await axios.post('http://localhost:3000/send-bill', {
//                 totalEnergy,
//                 totalBill
//             });
//             alert('Bill sent successfully!');
//         } catch (error) {
//             alert('Failed to send the bill. Please try again.');
//         }
//     };

//     // Render component
//     return (
//         <div className={darkMode ? 'container dark' : 'container light'}>
//             <h1>Smart Energy Meter</h1>
//             <label className="theme-switch">
//                 <input
//                     type="checkbox"
//                     checked={darkMode}
//                     onChange={() => setDarkMode(!darkMode)}
//                 />
//                 <span className="slider round"></span>
//                 <span className="theme-label">{darkMode ? 'Dark Mode' : 'Light Mode'}</span>
//             </label>

//             <h2>Live Readings</h2>
//             <div className="readings">
//                 <div className="reading-box">
//                     <h3>Voltage</h3>
//                     <p>{latestReading.voltage} V</p>
//                 </div>
//                 <div className="reading-box">
//                     <h3>Current</h3>
//                     <p>{latestReading.current} A</p>
//                 </div>
//                 <div className="reading-box">
//                     <h3>Power</h3>
//                     <p>{latestReading.power} W</p>
//                 </div>
//                 <div className="reading-box">
//                     <h3>Timestamp</h3>
//                     <p>{new Date(latestReading.timestamp).toLocaleString()}</p>
//                 </div>
//             </div>

//             <h2>Calculate Bill</h2>
//             <div className="input-container">
//                 <label>Start Date:</label>
//                 <input 
//                     type="datetime-local" 
//                     value={startDate} 
//                     onChange={(e) => setStartDate(e.target.value)} 
//                 />
//             </div>
//             <div className="input-container">
//                 <label>End Date:</label>
//                 <input 
//                     type="datetime-local" 
//                     value={endDate} 
//                     onChange={(e) => setEndDate(e.target.value)} 
//                 />
//             </div>
//             <button className="calculate-button" onClick={calculateBill} disabled={loading}>
//                 {loading ? 'Calculating...' : 'Calculate Bill'}
//             </button>
//             {error && <p className="error-message">{error}</p>}
//             {totalEnergy && <p>Total Energy Consumed: {totalEnergy} kWh</p>}
//             {totalBill && <p>Total Bill: {totalBill}</p>}

//             <h2>Download or Send Bill</h2>
//             <button onClick={downloadPDF}>Download PDF</button>
//             <button onClick={sendSMS}>Send Bill to Mobile</button>
//         </div>
//     );
// }

// export default BillCalculator;

