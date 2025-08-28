// JLU Certification Dashboard
const { useState, useEffect } = React;

const Dashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [employees, setEmployees] = useState([]);
  const [storeInfo, setStoreInfo] = useState({ storeNumber: "Loading...", totalEmployees: 0 });
  const [loading, setLoading] = useState(true);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Load data from Excel files
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // This will load from your Excel files in the data folder
      // For now, showing sample data
      setStoreInfo({
        storeNumber: "Multi-Store",
        districtManager: "Benjamin Braasch DM", 
        totalEmployees: 160,
        dashboardScore: 95
      });

      // Sample employee data - this will be replaced with real Excel data
      setEmployees([
        { name: "MORALES, ANDY", store: "609", daysUntilExpiry: -1, status: "critical" },
        { name: "CUGUA, MYNOR", store: "1002", daysUntilExpiry: 42, status: "warning" },
        { name: "HERNANDEZ, BRYAN", store: "1257", daysUntilExpiry: 44, status: "warning" },
        { name: "CENDEJAS, DEANNA", store: "1270", daysUntilExpiry: null, status: "missing" }
      ]);

      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setLoading(false);
    }
  };

  const criticalEmployees = employees.filter(emp => emp.status === 'critical' || emp.status === 'missing');
  const warningEmployees = employees.filter(emp => emp.status === 'warning');

  if (loading) {
    return React.createElement('div', {
      className: 'min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-red-900 text-white flex items-center justify-center'
    }, 
      React.createElement('div', { className: 'text-center' },
        React.createElement('div', { className: 'text-3xl font-bold mb-4' }, 'Loading JLU Dashboard...'),
        React.createElement('div', { className: 'text-red-200' }, 'Processing certification data...')
      )
    );
  }

  return React.createElement('div', {
    className: 'min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-red-900 text-white p-4'
  },
    // Header
    React.createElement('div', { className: 'mb-6' },
      React.createElement('div', { className: 'flex items-center justify-between' },
        React.createElement('div', { className: 'flex items-center space-x-4' },
          React.createElement('div', { className: 'bg-white rounded-lg p-3' },
            React.createElement('div', { className: 'text-red-800 font-bold text-lg' }, 'JLU')
          ),
          React.createElement('div', null,
            React.createElement('h1', { className: 'text-3xl font-bold' }, 'Jiffy Lube University Dashboard'),
            React.createElement('p', { className: 'text-red-200' }, `${storeInfo.storeNumber} Stores • DM: ${storeInfo.districtManager}`)
          )
        ),
        React.createElement('div', { className: 'text-right' },
          React.createElement('div', { className: 'text-xl font-mono' }, currentTime.toLocaleTimeString()),
          React.createElement('div', { className: 'text-red-200' }, currentTime.toLocaleDateString())
        )
      )
    ),

    // Key Metrics
    React.createElement('div', { className: 'grid grid-cols-3 gap-4 mb-6' },
      React.createElement('div', { className: 'bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20' },
        React.createElement('div', { className: 'text-2xl font-bold' }, storeInfo.totalEmployees),
        React.createElement('div', { className: 'text-sm text-white/70' }, 'Total Employees')
      ),
      React.createElement('div', { className: 'bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20' },
        React.createElement('div', { className: 'text-2xl font-bold text-red-400' }, criticalEmployees.length),
        React.createElement('div', { className: 'text-sm text-white/70' }, 'Critical/Missing')
      ),
      React.createElement('div', { className: 'bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20' },
        React.createElement('div', { className: 'text-2xl font-bold text-yellow-400' }, warningEmployees.length),
        React.createElement('div', { className: 'text-sm text-white/70' }, 'Expiring Soon')
      )
    ),

    // Critical Section
    React.createElement('div', { className: 'bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-red-300/50' },
      React.createElement('h2', { className: 'text-xl font-bold text-red-400 mb-4' }, 'CRITICAL ATTENTION REQUIRED'),
      React.createElement('div', { className: 'space-y-3' },
        criticalEmployees.length > 0 ? 
          criticalEmployees.map((employee, index) => 
            React.createElement('div', { 
              key: index, 
              className: 'bg-red-500/20 rounded-lg p-3 border border-red-400/30 flex justify-between items-center'
            },
              React.createElement('div', null,
                React.createElement('div', { className: 'font-semibold' }, employee.name),
                React.createElement('div', { className: 'text-sm text-red-200' }, `Store ${employee.store}`)
              ),
              React.createElement('div', { className: 'text-right' },
                employee.status === 'missing' ? 
                  React.createElement('div', { className: 'text-red-400 font-bold' }, 'NOT CERTIFIED') :
                  React.createElement('div', { className: 'text-red-400 font-bold' }, 'EXPIRED')
              )
            )
          ) :
          React.createElement('div', { className: 'text-center text-green-300 py-8' }, 'No critical certifications!')
      )
    )
  );
};

// Render the dashboard
ReactDOM.render(React.createElement(Dashboard), document.getElementById('root'));
