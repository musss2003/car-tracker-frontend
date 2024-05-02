import { Link } from 'react-router-dom';


function Dashboard() {

  const subjects = ['Math', 'Science', 'History']; // Example subjects

  return (
    <div className="bg-gray-100 p-4">
      <h1 className="text-xl font-bold text-center mb-4">Dashboard</h1>
      <ul className="space-y-2">
      {subjects.map(subject => (
          <li key={subject}>
            <Link to={`/grade-details/${subject}`}>{subject}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Dashboard;
