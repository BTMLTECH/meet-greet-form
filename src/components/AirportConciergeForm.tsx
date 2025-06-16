import React, { useState, useEffect } from "react";
import {
  User,
  Phone,
  Plane,
  MapPin,
  Calendar,
  Users,
  Luggage,
  Tag,
  CheckCircle,
  AlertCircle,
  Send,
  Clock,
} from "lucide-react";
import emailjs from "@emailjs/browser";

interface FormData {
  fullName: string;
  phoneNumber: string;
  airline: string;
  flightNumber: string;
  arrivalAirport: string;
  departureAirport: string;
  terminal: string;
  flightDateTime: string;
  numberOfBags: string;
  numberOfPassengers: string;
  adults: string;
  children: string;
  infants: string;
  voucherNumber: string;
  confirmAccuracy: boolean;
  understandProcedures: boolean;
}

interface FormErrors {
  [key: string]: string;
}

const AirportConciergeForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    phoneNumber: "",
    airline: "",
    flightNumber: "",
    arrivalAirport: "",
    departureAirport: "",
    terminal: "",
    flightDateTime: "",
    numberOfBags: "1",
    numberOfPassengers: "1",
    adults: "1",
    children: "0",
    infants: "0",
    voucherNumber: "",
    confirmAccuracy: false,
    understandProcedures: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [isFormValid, setIsFormValid] = useState(false);

  const airlines = [
    "Emirates",
    "Qatar Airways",
    "Singapore Airlines",
    "Lufthansa",
    "British Airways",
    "Air France",
    "KLM",
    "Turkish Airlines",
    "Etihad Airways",
    "Swiss International",
    "American Airlines",
    "Delta Air Lines",
    "United Airlines",
    "Other",
  ];

  const commonAirports = [
    "Dubai International (DXB)",
    "Doha Hamad (DOH)",
    "Singapore Changi (SIN)",
    "London Heathrow (LHR)",
    "Paris Charles de Gaulle (CDG)",
    "Frankfurt (FRA)",
    "Amsterdam Schiphol (AMS)",
    "Istanbul (IST)",
    "Abu Dhabi (AUH)",
    "Zurich (ZUR)",
    "New York JFK (JFK)",
    "Los Angeles (LAX)",
    "Tokyo Narita (NRT)",
    "Other",
  ];

  const validateField = (name: string, value: string | boolean): string => {
    switch (name) {
      case "fullName":
        return typeof value === "string" && value.trim().length < 2
          ? "Full name must be at least 2 characters"
          : "";
      case "phoneNumber":
        return typeof value === "string" &&
          !/^\+[1-9]\d{1,14}$/.test(value.replace(/\s/g, ""))
          ? "Please enter a valid phone number with country code (e.g., +1234567890)"
          : "";
      case "flightNumber":
        return typeof value === "string" &&
          !/^[A-Z]{2}[0-9]{1,4}$/i.test(value.replace(/\s/g, ""))
          ? "Please enter a valid flight number (e.g., AA123)"
          : "";
      case "flightDateTime":
        return typeof value === "string" && !value
          ? "Flight date and time is required"
          : "";
      default:
        return "";
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined;

    const newValue = type === "checkbox" ? checked! : value;

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    // Validate field on blur for required fields
    if (
      ["fullName", "phoneNumber", "flightNumber", "flightDateTime"].includes(
        name
      )
    ) {
      const error = validateField(name, newValue);
      if (error) {
        setErrors((prev) => ({
          ...prev,
          [name]: error,
        }));
      }
    }
  };

  const checkFormValidity = () => {
    const requiredFields = [
      "fullName",
      "phoneNumber",
      "flightNumber",
      "flightDateTime",
    ];
    const hasRequiredFields = requiredFields.every(
      (field) => formData[field as keyof FormData]
    );
    const hasNoErrors = Object.values(errors).every((error) => !error);
    const hasAgreements =
      formData.confirmAccuracy && formData.understandProcedures;

    return hasRequiredFields && hasNoErrors && hasAgreements;
  };

  useEffect(() => {
    setIsFormValid(checkFormValidity());
  }, [formData, errors]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all required fields
    const newErrors: FormErrors = {};
    ["fullName", "phoneNumber", "flightNumber", "flightDateTime"].forEach(
      (field) => {
        const error = validateField(field, formData[field as keyof FormData]);
        if (error) newErrors[field] = error;
      }
    );

    if (!formData.confirmAccuracy) {
      newErrors.confirmAccuracy =
        "Please confirm that all information is accurate";
    }
    if (!formData.understandProcedures) {
      newErrors.understandProcedures =
        "Please confirm you understand the procedures";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      // Initialize EmailJS (you'll need to replace these with your actual IDs)
      const templateParams = {
        to_email: "bookings@btmholidays.com", // Replace with your email
        from_name: formData.fullName,
        phone_number: formData.phoneNumber,
        airline: formData.airline,
        flight_number: formData.flightNumber,
        arrival_airport: formData.arrivalAirport,
        departure_airport: formData.departureAirport,
        terminal: formData.terminal,
        flight_date_time: formData.flightDateTime,
        number_of_bags: formData.numberOfBags,
        number_of_passengers: formData.numberOfPassengers,
        adults: formData.adults,
        children: formData.children,
        infants: formData.infants,
        voucher_number: formData.voucherNumber,
        message: `Airport Concierge Service Request from ${formData.fullName}:\n\n
        - Name: ${formData.fullName}\n
        - Phone Number: ${formData.phoneNumber}\n
        - Airline: ${formData.airline}\n
        - Flight Number: ${formData.flightNumber}\n
        - Arrival Airport: ${formData.arrivalAirport}\n
        - Departure Airport: ${formData.departureAirport}\n
        - Terminal: ${formData.terminal}\n
        - Flight Date & Time: ${formData.flightDateTime}\n
        - Number of Bags: ${formData.numberOfBags}\n
        - Number of Passengers: ${formData.numberOfPassengers}\n
        - Adults: ${formData.adults}\n
        - Children: ${formData.children}\n
        - Infants: ${formData.infants}\n
        - Voucher number: ${formData.voucherNumber || null}
        `,
      };

      await emailjs.send(
        import.meta.env.VITE_APP_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_APP_EMAILJS_TEMPLATE_ID,
        templateParams,
        import.meta.env.VITE_APP_EMAILJS_PUBLIC_ID
      );

      setSubmitStatus("success");
      // Reset form after successful submission
      setTimeout(() => {
        setFormData({
          fullName: "",
          phoneNumber: "",
          airline: "",
          flightNumber: "",
          arrivalAirport: "",
          departureAirport: "",
          terminal: "",
          flightDateTime: "",
          numberOfBags: "1",
          numberOfPassengers: "1",
          adults: "1",
          children: "0",
          infants: "0",
          voucherNumber: "",
          confirmAccuracy: false,
          understandProcedures: false,
        });
        // setSubmitStatus('idle');
      }, 3000);
    } catch (error) {
      console.error("EmailJS Error:", error);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
            <h1 className="text-2xl md:text-3xl font-bold text-white text-center">
              BTM Holidays – Airport Concierge Service Confirmation Form
            </h1>
            <p className="text-blue-100 text-center mt-2">
              Please fill out all required information for your airport
              concierge service
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Personal Details Section */}
            <div className="space-y-6">
              <div className="flex items-center space-x-2 border-b border-gray-200 pb-2">
                <User className="h-5 w-5 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-800">
                  Personal Details
                </h2>
                <span className="text-red-500 text-sm">
                  *Required
                </span>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="fullName"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Full Name (as on passport) *
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.fullName
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300"
                    }`}
                    placeholder="Enter your full name"
                  />
                  {errors.fullName && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.fullName}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="phoneNumber"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Phone Number (with country code) *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                    <input
                      type="tel"
                      id="phoneNumber"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        errors.phoneNumber
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300"
                      }`}
                      placeholder="+1234567890"
                    />
                  </div>
                  {errors.phoneNumber && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.phoneNumber}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Flight Details Section */}
            <div className="space-y-6">
              <div className="flex items-center space-x-2 border-b border-gray-200 pb-2">
                <Plane className="h-5 w-5 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-800">
                  Flight Details
                </h2>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="airline"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Airline
                  </label>
                  <select
                    id="airline"
                    name="airline"
                    value={formData.airline}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="">Select an airline</option>
                    {airlines.map((airline) => (
                      <option key={airline} value={airline}>
                        {airline}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="flightNumber"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Flight Number *
                  </label>
                  <input
                    type="text"
                    id="flightNumber"
                    name="flightNumber"
                    value={formData.flightNumber}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.flightNumber
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300"
                    }`}
                    placeholder="e.g., AA123"
                  />
                  {errors.flightNumber && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.flightNumber}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="departureAirport"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Departure Airport
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      id="departureAirport"
                      name="departureAirport"
                      value={formData.departureAirport}
                      onChange={handleInputChange}
                      className={`w-full px-8 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        errors.departureAirport
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300"
                      }`}
                      placeholder="e.g., London Heathrow (LHR)"
                    />
                    {/* <select
                      id="departureAirport"
                      name="departureAirport"
                      value={formData.departureAirport}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    >
                      <option value="">Select departure airport</option>
                      {commonAirports.map((airport) => (
                        <option key={airport} value={airport}>{airport}</option>
                      ))}
                    </select> */}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="arrivalAirport"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Arrival Airport
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      id="arrivalAirport"
                      name="arrivalAirport"
                      value={formData.arrivalAirport}
                      onChange={handleInputChange}
                      className={`w-full px-8 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        errors.arrivalAirport
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300"
                      }`}
                      placeholder="e.g., London Heathrow (LHR)"
                    />
                    {/* <select
                      id="arrivalAirport"
                      name="arrivalAirport"
                      value={formData.arrivalAirport}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    >
                      <option value="">Select arrival airport</option>
                      {commonAirports.map((airport) => (
                        <option key={airport} value={airport}>{airport}</option>
                      ))}
                    </select> */}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="terminal"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Terminal (if known)
                  </label>
                  <input
                    type="text"
                    id="terminal"
                    name="terminal"
                    value={formData.terminal}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="e.g., Terminal 1"
                  />
                </div>

                <div>
                  <label
                    htmlFor="flightDateTime"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Flight Date & Time (local time) *
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                    <input
                      type="datetime-local"
                      id="flightDateTime"
                      name="flightDateTime"
                      value={formData.flightDateTime}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        errors.flightDateTime
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300"
                      }`}
                    />
                  </div>
                  {errors.flightDateTime && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.flightDateTime}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="numberOfBags"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Number of Bags
                  </label>
                  <div className="relative">
                    <Luggage className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                    <input
                      type="number"
                      id="numberOfBags"
                      name="numberOfBags"
                      value={formData.numberOfBags}
                      onChange={handleInputChange}
                      min="0"
                      max="20"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Passenger Info Section */}
            <div className="space-y-6">
              <div className="flex items-center space-x-2 border-b border-gray-200 pb-2">
                <Users className="h-5 w-5 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-800">
                  Passenger Information
                </h2>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label
                    htmlFor="numberOfPassengers"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Total Passengers
                  </label>
                  <input
                    type="number"
                    id="numberOfPassengers"
                    name="numberOfPassengers"
                    value={formData.numberOfPassengers}
                    onChange={handleInputChange}
                    min="1"
                    max="20"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <label
                    htmlFor="adults"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Adults
                  </label>
                  <input
                    type="number"
                    id="adults"
                    name="adults"
                    value={formData.adults}
                    onChange={handleInputChange}
                    min="1"
                    max="20"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <label
                    htmlFor="children"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Children
                  </label>
                  <input
                    type="number"
                    id="children"
                    name="children"
                    value={formData.children}
                    onChange={handleInputChange}
                    min="0"
                    max="10"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <label
                    htmlFor="infants"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Infants
                  </label>
                  <input
                    type="number"
                    id="infants"
                    name="infants"
                    value={formData.infants}
                    onChange={handleInputChange}
                    min="0"
                    max="10"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Discounts Section */}
            <div className="space-y-6">
              <div className="flex items-center space-x-2 border-b border-gray-200 pb-2">
                <Tag className="h-5 w-5 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-800">
                  Discounts
                </h2>
              </div>

              <div>
                <label
                  htmlFor="voucherNumber"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Voucher Number / BTM Discount Code
                </label>
                <input
                  type="text"
                  id="voucherNumber"
                  name="voucherNumber"
                  value={formData.voucherNumber}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter voucher code (optional)"
                />
              </div>
            </div>

            {/* Agreement Section */}
            <div className="space-y-6">
              <div className="flex items-center space-x-2 border-b border-gray-200 pb-2">
                <CheckCircle className="h-5 w-5 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-800">
                  Agreement
                </h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="confirmAccuracy"
                    name="confirmAccuracy"
                    checked={formData.confirmAccuracy}
                    onChange={handleInputChange}
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="confirmAccuracy"
                    className="text-sm text-gray-700"
                  >
                    I confirm that all information provided is accurate. *
                  </label>
                </div>
                {errors.confirmAccuracy && (
                  <p className="text-sm text-red-600 flex items-center ml-7">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.confirmAccuracy}
                  </p>
                )}

                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="understandProcedures"
                    name="understandProcedures"
                    checked={formData.understandProcedures}
                    onChange={handleInputChange}
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="understandProcedures"
                    className="text-sm text-gray-700"
                  >
                    I understand that this service does not bypass
                    immigration/security procedures. *
                  </label>
                </div>
                {errors.understandProcedures && (
                  <p className="text-sm text-red-600 flex items-center ml-7">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.understandProcedures}
                  </p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={!isFormValid || isSubmitting}
                className={`w-full py-4 px-6 rounded-lg font-semibold text-white transition-all duration-200 flex items-center justify-center space-x-2 ${
                  isFormValid && !isSubmitting
                    ? "bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    <span>Submit Confirmation Request</span>
                  </>
                )}
              </button>
            </div>

            {/* Status Messages */}
            {submitStatus === "success" && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <p className="text-green-800">
                  Thank you! Your airport concierge service request has been
                  submitted successfully. We will contact you shortly to confirm
                  the details.
                </p>
              </div>
            )}

            {submitStatus === "error" && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <p className="text-red-800">
                  There was an error submitting your request. Please try again
                  or contact us directly.
                </p>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default AirportConciergeForm;
