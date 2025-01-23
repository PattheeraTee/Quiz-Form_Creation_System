"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useSearchParams } from "next/navigation";

export default function SettingsForm() {
  const searchParams = useSearchParams();
  const form_id = searchParams.get("form_id");
  const [emailIncluded, setEmailIncluded] = useState(false);
  const [limitToOneResponse, setLimitToOneResponse] = useState(false);
  const [allowResponse, setAllowResponse] = useState(false);
  const [enableStartDate, setEnableStartDate] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("00:00");
  const [enableEndDate, setEnableEndDate] = useState(false);
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("00:00");
  const [shuffleQuestions, setShuffleQuestions] = useState(false);

  // Utility: Get current date and time adjusted to Thai timezone (GMT+7)
  const getCurrentThaiDateTime = () => {
    const now = new Date();
    const offset = 7 * 60 * 60 * 1000; // GMT+7 in milliseconds
    const thaiTime = new Date(now.getTime() + offset);
    const thaiDate = thaiTime.toISOString().split("T")[0];
    const thaiTimeString = thaiTime.toTimeString().split(" ")[0].slice(0, 5);
    return { thaiDate, thaiTimeString };
  };

  const { thaiDate, thaiTimeString } = getCurrentThaiDateTime();

  const fetchFormData = async () => {
    if (form_id) {
      try {
        const response = await axios.get(
          `http://localhost:3001/form/${form_id}`
        );
        const formData = response.data;

        // Update state based on fetched data
        setEmailIncluded(!!formData.form.email_require);
        setLimitToOneResponse(!!formData.form.limit_one_response);
        setAllowResponse(!!formData.form.is_form_open);

        if (formData.form.start_date) {
          const startDateTime = new Date(formData.form.start_date);
          setEnableStartDate(true);

          // Convert date to local format
          const localStartDate = new Date(
            startDateTime.getTime() - startDateTime.getTimezoneOffset() * 60000
          );
          setStartDate(localStartDate.toISOString().split("T")[0]);
          setStartTime(localStartDate.toTimeString().split(" ")[0].slice(0, 5));
        } else {
          setEnableStartDate(false);
        }

        if (formData.form.end_date) {
          const endDateTime = new Date(formData.form.end_date);
          setEnableEndDate(true);

          // Convert date to local format
          const localEndDate = new Date(
            endDateTime.getTime() - endDateTime.getTimezoneOffset() * 60000
          );
          setEndDate(localEndDate.toISOString().split("T")[0]);
          setEndTime(localEndDate.toTimeString().split(" ")[0].slice(0, 5));
        } else {
          setEnableEndDate(false);
        }

        setShuffleQuestions(!!formData.form.shuffle_question);
      } catch (error) {
        console.error("Error fetching form data:", error);
      }
    }
  };

  const handleDateChange = (setter, value) => {
    // Directly set the value from input
    setter(value);
  };

  // Initial fetch
  useEffect(() => {
    fetchFormData();
  }, [form_id]);

  // Update form data function
  const updateForm = (key, value) => {
    axios
      .patch(`http://localhost:3001/form/${form_id}`, { [key]: value })
      .then(() => {
        console.log(`${key} updated successfully.`);
        fetchFormData(); // Refresh state after update
      })
      .catch((error) => {
        console.error(`Error updating ${key}:`, error);
      });
  };

  const generateTimeOptions = () => {
    const times = [];
    for (let i = 0; i < 24; i++) {
      for (let j = 0; j < 60; j += 15) {
        const hour = i.toString().padStart(2, "0");
        const minute = j.toString().padStart(2, "0");
        times.push(`${hour}:${minute}`);
      }
    }
    return times;
  };

  const isPastDateTime = (date, time) => {
    const selectedDateTime = new Date(`${date}T${time}:00`);

    // Adjust current time to Thai timezone (GMT+7)
    const now = new Date();
    const currentThaiTime = new Date(now.getTime());

    return selectedDateTime < currentThaiTime;
  };

  return (
    <div className="bg-white text-black max-w-2xl mx-auto p-6 rounded-xl shadow mt-6">
      <h2 className="text-lg font-semibold mb-4">การตั้งค่า</h2>
      <div className="mb-6 p-4 bg-gray-100 rounded-lg">
        <h3 className="text-xl font-medium mb-2">การตอบกลับ</h3>
        <label className="flex items-center mb-2">
          <input
            type="checkbox"
            checked={emailIncluded}
            onChange={(e) => {
              setEmailIncluded(e.target.checked);
              updateForm("email_require", e.target.checked);
            }}
            className="mr-2"
          />
          รวมรวมที่อยู่อีเมล
        </label>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={limitToOneResponse}
            onChange={(e) => {
              setLimitToOneResponse(e.target.checked);
              updateForm("limit_one_response", e.target.checked);
            }}
            className="mr-2"
          />
          จํากัดการตอบกลับ 1 ครั้ง
        </label>
      </div>
      <div className="mb-6 p-4 bg-gray-100 rounded-lg">
        <h3 className="text-xl font-medium mb-2">การตอบสนอง</h3>
        <label className="flex items-center mb-4">
          <input
            type="checkbox"
            checked={allowResponse}
            onChange={(e) => {
              setAllowResponse(e.target.checked);
              updateForm("is_form_open", e.target.checked);
            }}
            className="mr-2"
          />
          ยอมรับการตอบกลับ
        </label>
        <div className="mb-4">
          <label className="flex items-center mb-2">
            <input
              type="checkbox"
              checked={enableStartDate}
              onChange={(e) => {
                setEnableStartDate(e.target.checked);
                if (!e.target.checked) {
                  setStartDate("");
                  setStartTime("00:00");
                  updateForm("start_date", null);
                }
              }}
              className="mr-2"
            />
            วันที่เริ่มต้น
          </label>
          {enableStartDate && (
            <div className="flex items-center mb-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  handleDateChange(setStartDate, e.target.value);
                  updateForm("start_date", `${e.target.value}T${startTime}:00`);
                }}
                className="mr-2 p-2 border rounded"
                min={thaiDate}
              />

              <select
                value={startTime}
                onChange={(e) => {
                  setStartTime(e.target.value);
                  updateForm("start_date", `${startDate}T${e.target.value}:00`);
                }}
                className="p-2 border rounded"
              >
                {generateTimeOptions().map((time) => (
                  <option
                    key={time}
                    value={time}
                    disabled={isPastDateTime(startDate, time)}
                  >
                    {time}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
        <div className="mb-4">
          <label className="flex items-center mb-2">
            <input
              type="checkbox"
              checked={enableEndDate}
              onChange={(e) => {
                setEnableEndDate(e.target.checked);
                if (!e.target.checked) {
                  setEndDate("");
                  setEndTime("00:00");
                  updateForm("end_date", null);
                }
              }}
              className="mr-2"
            />
            วันที่สิ้นสุด
          </label>
          {enableEndDate && (
            <div className="flex items-center">
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  handleDateChange(setEndDate, e.target.value);
                  updateForm("end_date", `${e.target.value}T${endTime}:00`);
                }}
                className="mr-2 p-2 border rounded"
                min={thaiDate}
              />

              <select
                value={endTime}
                onChange={(e) => {
                  setEndTime(e.target.value);
                  updateForm("end_date", `${endDate}T${e.target.value}:00`);
                }}
                className="p-2 border rounded"
              >
                {generateTimeOptions().map((time) => (
                  <option
                    key={time}
                    value={time}
                    disabled={isPastDateTime(endDate, time)}
                  >
                    {time}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={shuffleQuestions}
            onChange={(e) => {
              setShuffleQuestions(e.target.checked);
              updateForm("shuffle_question", e.target.checked);
            }}
            className="mr-2"
          />
          สลับคําถาม
        </label>
      </div>
    </div>
  );
}
