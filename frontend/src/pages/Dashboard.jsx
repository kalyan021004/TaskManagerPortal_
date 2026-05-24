import React from 'react';
import KanbanBoard from '../components/KanbanBoard';
import '../styles/Dashboard.css';

const Dashboard = () => {
  return (
    <div className="dashboard">
      <KanbanBoard />
    </div>
  );
};

export default Dashboard;
