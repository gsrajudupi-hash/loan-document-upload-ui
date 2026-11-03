import  { useEffect, useState } from "react";
import "./LoanApplication.css";

const API = "/api";

function LoanApplication() {

    const [buckets, setBuckets] = useState([]);

    const [files, setFiles] = useState([]);

    const [message, setMessage] = useState("");

    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        customerName: "",
        email: "",
        mobile: "",
        loanType: "Personal Loan",
        loanAmount: ""
    });

    // Load S3 buckets

    useEffect(() => {

        fetch(`${API}/buckets`)
            .then(response => {
                if (!response.ok) {
                    throw new Error("Unable to load buckets");
                }
                return response.json();
            })
            .then(data => setBuckets(data))
            .catch(error => setMessage(error.message));

    }, []);

    // Handle input fields

    const handleChange = (e) => {

        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    // Handle file selection

    const handleFileChange = (e) => {

        setFiles(Array.from(e.target.files));
    };

    // Submit application

    const handleSubmit = async (e) => {

        e.preventDefault();

        setLoading(true);
        setMessage("");

        try {

            const data = new FormData();

            const application = {
                ...form,
                loanAmount: Number(form.loanAmount)
            };

            data.append(
                "application",
                new Blob(
                    [JSON.stringify(application)],
                    { type: "application/json" }
                )
            );

            files.forEach(file => {
                data.append("files", file);
            });

            const response = await fetch(
                `${API}/applications`,
                {
                    method: "POST",
                    body: data
                }
            );

            if (!response.ok) {
                throw new Error("Application submission failed");
            }

            const result = await response.json();

            setMessage(
                `Application submitted successfully. ID: ${result.id}`
            );

            setForm({
                customerName: "",
                email: "",
                mobile: "",
                loanType: "Personal Loan",
                loanAmount: ""
            });

            setFiles([]);

            e.target.reset();

        } catch (error) {

            setMessage(error.message);

        } finally {

            setLoading(false);
        }
    };

    return (

        <div className="container">

            <div className="header">
                <h1>Loan Application Portal</h1>
                <p>Submit your loan application and documents</p>
            </div>

            <div className="card">

                <h2>Customer Information</h2>

                <form onSubmit={handleSubmit}>

                    <div className="form-grid">

                        <div>
                            <label>Customer Name</label>

                            <input
                                name="customerName"
                                value={form.customerName}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div>
                            <label>Email Address</label>

                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div>
                            <label>Mobile Number</label>

                            <input
                                name="mobile"
                                value={form.mobile}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div>
                            <label>Loan Type</label>

                            <select
                                name="loanType"
                                value={form.loanType}
                                onChange={handleChange}
                            >
                                <option>Personal Loan</option>
                                <option>Home Loan</option>
                                <option>Vehicle Loan</option>
                                <option>Education Loan</option>
                            </select>
                        </div>

                        <div>
                            <label>Loan Amount</label>

                            <input
                                type="number"
                                name="loanAmount"
                                value={form.loanAmount}
                                onChange={handleChange}
                                min="1"
                                required
                            />
                        </div>

                    </div>

                    <h2>Amazon S3 Information</h2>

                    <label>Available S3 Buckets</label>

                    <select disabled={!buckets.length}>
                        {buckets.map(bucket => (
                            <option key={bucket}>
                                {bucket}
                            </option>
                        ))}
                    </select>

                    <h2>Upload Loan Documents</h2>

                    <p>
                        Upload PAN, Aadhaar, salary slips
                        and bank statements.
                    </p>

                    <input
                        type="file"
                        multiple
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileChange}
                        required
                    />

                    <div className="file-list">

                        {files.map((file, index) => (
                            <p key={index}>
                                {file.name}
                            </p>
                        ))}

                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                    >
                        {loading
                            ? "Submitting..."
                            : "Submit Application"}
                    </button>

                </form>

                {message && (
                    <div className="message">
                        {message}
                    </div>
                )}

            </div>

        </div>
    );
}

export default LoanApplication;