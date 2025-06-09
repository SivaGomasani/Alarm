import React, { useEffect, useState, useRef } from "react";
import alarm1 from "./iphone_alarm.mp3";
import alarm2 from "./unkul_telugu.mp3";
import alarm3 from "./vijays_ringto_master.mp3";
import "./styles.css";

function Alarm() {
  const [alarms, setAlarms] = useState([]);
  const [selectedAlarm, setSelectedAlarm] = useState(alarm1);
  const [newAlarm, setNewAlarm] = useState({ hours: 0, min: 0, seconds: 0 });
  const audioRefs = useRef({});

  const handleChange = (e) => {
    const { id, value } = e.target;
    let val = parseInt(value, 10);
    if ((id === "seconds" || id === "min") && val > 59) val = 59;
    if (val < 0 || isNaN(val)) val = 0;
    setNewAlarm((prev) => ({ ...prev, [id]: val }));
  };

  const addAlarm = () => {
    const totalSeconds = newAlarm.hours * 3600 + newAlarm.min * 60 + newAlarm.seconds;
    if (totalSeconds === 0) {
      alert("Please set a valid alarm time!");
      return;
    }
    setAlarms((prev) => [
      ...prev,
      {
        ...newAlarm,
        alarmSound: selectedAlarm,
        isActive: false,
        remainingTime: totalSeconds,
        played: false,
      },
    ]);
    setNewAlarm({ hours: 0, min: 0, seconds: 0 }); // Reset input fields
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setAlarms((prevAlarms) =>
        prevAlarms.map((alarm, index) => {
          if (alarm.remainingTime > 0 && !alarm.isActive) {
            return { ...alarm, remainingTime: alarm.remainingTime - 1 };
          } else if (alarm.remainingTime === 0 && !alarm.isActive && !alarm.played) {
            playAlarm(alarm.alarmSound, index);
            return { ...alarm, isActive: true, played: true };
          }
          return alarm;
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const playAlarm = (sound, index) => {
    if (audioRefs.current[index]) return; // Already playing

    const audio = new Audio(sound);
    audio.loop = true;
    audio.play();
    audioRefs.current[index] = audio;
  };

  const stopAlarm = (index) => {
    const audio = audioRefs.current[index];
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      audio.loop = false;
      delete audioRefs.current[index];
    }
    setAlarms((prev) =>
      prev.map((a, i) => (i === index ? { ...a, isActive: false } : a))
    );
  };

  const removeAlarm = (index) => {
    stopAlarm(index);
    setAlarms((prev) => prev.filter((_, i) => i !== index));
  };

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, "0")}h : ${m.toString().padStart(2, "0")}m : ${s
      .toString()
      .padStart(2, "0")}s`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-black to-gray-900 text-white flex flex-col items-center p-6 font-mono">
      <h1 className="text-5xl font-bold text-red-500 drop-shadow-lg mt-10 mb-8">⏰ Smart Alarm Clock</h1>

      <div className="bg-gray-800 rounded-xl p-6 shadow-lg w-full max-w-xl">
        <h2 className="text-2xl font-semibold text-yellow-400 mb-6">Set Alarm</h2>

        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <label className="block text-sm text-gray-300">Hours</label>
            <input
              type="number"
              id="hours"
              placeholder="HH"
              onChange={handleChange}
              value={newAlarm.hours}
              className="w-full px-4 py-2 rounded-md bg-gray-700 text-white text-center"
              min="0"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm text-gray-300">Minutes</label>
            <input
              type="number"
              id="min"
              placeholder="MM"
              onChange={handleChange}
              value={newAlarm.min}
              className="w-full px-4 py-2 rounded-md bg-gray-700 text-white text-center"
              min="0"
              max="59"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm text-gray-300">Seconds</label>
            <input
              type="number"
              id="seconds"
              placeholder="SS"
              onChange={handleChange}
              value={newAlarm.seconds}
              className="w-full px-4 py-2 rounded-md bg-gray-700 text-white text-center"
              min="0"
              max="59"
            />
          </div>
        </div>

        <label className="block text-sm text-gray-300 mb-1">Alarm Sound</label>
        <select
          onChange={(e) => setSelectedAlarm(e.target.value)}
          value={selectedAlarm}
          className="w-full px-4 py-2 mb-6 rounded-md bg-gray-700 text-white"
        >
          <option value={alarm1}>📱 iPhone Alarm</option>
          <option value={alarm2}>👨‍🦰 Uncle Alarm</option>
          <option value={alarm3}>🎶 Vijay's Alarm</option>
        </select>

        <button
          onClick={addAlarm}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-md transition-all duration-300"
        >
          ➕ Add Alarm
        </button>
      </div>

      <div className="w-full max-w-3xl mt-12">
        <h2 className="text-3xl font-semibold text-green-400 mb-6">🕒 Active Alarms</h2>
        {alarms.length === 0 ? (
          <p className="text-gray-400 italic text-center">No alarms set yet.</p>
        ) : (
          <ul className="space-y-5">
            {alarms.map((alarm, index) => (
              <li
                key={index}
                className={`flex flex-col md:flex-row justify-between items-center p-5 rounded-xl bg-gray-800 border-2 ${
                  alarm.isActive ? "border-yellow-400 animate-pulse" : "border-gray-700"
                }`}
              >
                <div className="text-lg text-white">
                  {alarm.isActive ? "🚨 Alarm! " : "⏳ Remaining: "}
                  <span className="text-yellow-300">{formatTime(Math.max(alarm.remainingTime, 0))}</span>
                </div>
                <div className="flex gap-4 mt-4 md:mt-0">
                  <button
                    onClick={() => stopAlarm(index)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-4 py-1 rounded"
                  >
                    🛑 Stop
                  </button>
                  <button
                    onClick={() => removeAlarm(index)}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded"
                  >
                    ❌ Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Alarm;