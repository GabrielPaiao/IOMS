// ioms-frontend/src/pages/OutageCalendarPage.tsx
import { useNavigate } from "react-router-dom";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";

export default function OutageCalendarPage() {
  const navigate = useNavigate();

  const events = [
    {
      title: "2 outages",
      start: new Date(),
      extendedProps: { count: 2, outageIds: [101, 102] }
    }
  ];

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <FullCalendar
        plugins={[dayGridPlugin]}
        initialView="dayGridMonth"
        events={events}
        eventClick={(info) => {
          if (info.event.extendedProps.count > 0) {
            navigate(`/date/${info.event.startStr}`);
          }
        }}
        eventContent={(arg) => (
          arg.event.extendedProps.count > 0 && (
            <div className="text-center">
              <span className="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                {arg.event.extendedProps.count} outages
              </span>
            </div>
          )
        )}
      />
    </div>
  );
}