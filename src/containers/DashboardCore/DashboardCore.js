import CoursesOverview from "../../components/CoursesOverview/CoursesOverview";
import Notifications from "../../components/Notifications/Notifications";
import PerformanceGraphs from "../../components/PerformanceGraphs/PerformanceGraphs";
import SummaryPanel from "../../components/SummaryPanel/SummaryPanel";
import UpcomingAssignments from "../../components/UpcomingAssignments/UpcomingAssignments";

function DashboardCore() {

    const assignments = [
        {
            name: "Written Essay",
            dueDate: "12-07-2024",
            course: "Database Management",
            priority: "HIGH"
        },
        {
            name: "Written Essay",
            dueDate: "12-07-2024",
            course: "Database Management",
            priority: "HIGH"
        }
    ]

    const courses = [
        {
            name: "Database Management",
            grade: 3.7,
            nextAssignment: "Database Project"
        },
        {
            name: "Database Management",
            grade: 3.7,
            nextAssignment: "Database Project"
        }
    ]
    const performance = [
        { "period": "Week 1", "grade": 85 },
        { "period": "Week 2", "grade": 87 },
        { "period": "Week 3", "grade": 90 },
        { "period": "Week 4", "grade": 88 },
        { "period": "Week 5", "grade": 91 }
    ];

    const notifications = [
        {
            "id": 1,
            "message": "Your grade for the Algebra II midterm is now available.",
            "type": "Grade Update",
            "timestamp": "2024-05-05T14:48:00.000Z"
        },
        {
            "id": 2,
            "message": "Assignment 'Calculus homework 5' is due in 3 days.",
            "type": "Assignment Deadline",
            "timestamp": "2024-05-04T09:20:00.000Z"
        },
        {
            "id": 3,
            "message": "New content added to the course 'Introduction to Python'.",
            "type": "Course Update",
            "timestamp": "2024-05-03T16:15:00.000Z"
        },
        {
            "id": 4,
            "message": "Scheduled maintenance will occur this Saturday from 1 AM to 3 AM.",
            "type": "System Alert",
            "timestamp": "2024-05-02T11:00:00.000Z"
        },
        {
            "id": 5,
            "message": "Reminder: Schedule an advisor meeting before the end of the semester.",
            "type": "Personal Reminder",
            "timestamp": "2024-05-01T13:45:00.000Z"
        }
    ]

    const user = {
        gpa: {
            current: 3.61,
            lastSemester: 3.72
        },
        status: "ENROLLED"
    }
    
    
    return (
        <>
            <SummaryPanel user={user} />
            <UpcomingAssignments assignments={assignments}/>
            <PerformanceGraphs data={performance} />
            <CoursesOverview courses={courses}/>
            <Notifications alerts={notifications}/>
        </>
    );
}

export default DashboardCore;