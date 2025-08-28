// JLU Multi-Store Dashboard with React Router
const { useState, useEffect } = React;
const { BrowserRouter, Routes, Route, useParams, Link, Navigate } = ReactRouterDOM;

// Store Dashboard Component
const StoreDashboard = () => {
  const { storeId } = useParams();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [employees, setEmployees] = useState([]);
  const [storeInfo, setStoreInfo] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    loadStoreData(storeId);
  }, [storeId]);

  const loadStoreData = async (storeNumber) => {
    try {
      setLoading(true);
      
      // Load the specific store's MDC report
      const filename = `MDCReport_Store${storeNumber}_${new Date().toISOString().split('T')[0]}.xlsx`;
      
      // For now, using sample data - this will be replaced with actual Excel reading
      setStoreInfo({
        storeNumber: storeNumber,
        districtManager: "Benjamin Braasch DM",
        totalEmployees: 20,
        dashboardScore: 95
      });

      // Sample employee data for this store
      const sampleData = {
        '609': [
          { name: "MORALES, ANDY", position: "Service Tech", daysUntilExpiry: -1, status: "critical" },
          { name: "AVALOS, RAMON", position: "Technician", daysUntilExpiry: 180, status: "good" },
          { name: "RUIZ, ERIC", position: "Manager", daysUntilExpiry: 45, status: "warning" }
        ],
        '1002': [
          { name: "CUGUA, MYNOR", position: "Technician", daysUntilExpiry: 42, status: "warning" },
          { name: "BLACK, DEVIN", position: "Upper Bay Tech", daysUntilExpiry: 207, status: "good" }
        ],
        '1257': [
          { name: "HERNANDEZ, BRYAN", position: "Lower Bay Tech", daysUntilExpiry: 44, status: "warning" }
        ]
      };

      setEmployees(sampleData[storeNumber] || []);
      setLoading(false);
    } catch (error) {
      console.error('Error loading store data:', error);
      setLoading(false);
    }
  };

  const criticalEmployees = employees.filter(emp => emp.status === 'critical' || emp.status === 'missing');
  const warningEmployees = employees.filter(emp => emp.status === 'warning');
  const goodEmployees = employees.filter(emp => emp.status === 'good');

  if (loading) {
    return React.createElement('div', {
      className: 'min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-red-900 text-white flex items-center justify-center'
    }, 
      React.createElement('div', { className: 'text-center' },
        React.createElement('div', { className: 'text-3xl font-bold mb-4' }, `Loading Store ${storeId} Dashboard...`),
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
            React.createElement('h1', { className: 'text-3xl font-bold' }, `Store ${storeId} Certification Dashboard`),
            React.createElement('p', { className: 'text-red-200' }, `DM: ${storeInfo.districtManager}`)
          )
        ),
        React.createElement('div', { className: 'text-right' },
          React.createElement('div', { className: 'text-xl font-mono' }, currentTime.toLocaleTimeString()),
          React.createElement('div', { className: 'text-red-200' }, currentTime.toLocaleDateString())
        )
      )
    ),

    // Store Navigation
    React.createElement('div', { className: 'mb-4 flex space-x-2' },
      ['609', '1002', '1257', '1270', '1396', '1932', '2911', '4182'].map(store =>
        React.createElement(Link, {
          key: store,
          to: `/store/${store}`,
          className: `px-3 py-1 rounded text-sm ${store === storeId ? 'bg-white text-red-800' : 'bg-white/20 hover:bg-white/30'}`
        }, `Store ${store}`)
      ),
      React.createElement(Link, {
        to: '/franchise',
        className: 'px-3 py-1 rounded text-sm bg-blue-500/20 hover:bg-blue-500/30'
      }, 'Franchise View')
    ),

    // Key Metrics
    React.createElement('div', { className: 'grid grid-cols-4 gap-4 mb-6' },
      React.createElement('div', { className: 'bg-white/10 backdrop-blur-sm rounded-xl p-4' },
        React.createElement('div', { className: 'text-2xl font-bold' }, storeInfo.totalEmployees),
        React.createElement('div', { className: 'text-sm text-white/70' }, 'Total Employees')
      ),
      React.createElement('div', { className: 'bg-white/10 backdrop-blur-sm rounded-xl p-4' },
        React.createElement('div', { className: 'text-2xl font-bold text-red-400' }, criticalEmployees.length),
        React.createElement('div', { className: 'text-sm text-white/70' }, 'Critical/Missing')
      ),
      React.createElement('div', { className: 'bg-white/10 backdrop-blur-sm rounded-xl p-4' },
        React.createElement('div', { className: 'text-2xl font-bold text-yellow-400' }, warningEmployees.length),
        React.createElement('div', { className: 'text-sm text-white/70' }, 'Expiring Soon')
      ),
      React.createElement('div', { className: 'bg-white/10 backdrop-blur-sm rounded-xl p-4' },
        React.createElement('div', { className: 'text-2xl font-bold text-green-400' }, goodEmployees.length),
        React.createElement('div', { className: 'text-sm text-white/70' }, 'Current & Good')
      )
    ),

    // Employee Details
    React.createElement('div', { className: 'grid grid-cols-2 gap-6' },
      // Critical Section
      React.createElement('div', { className: 'bg-white/10 backdrop-blur-sm rounded-xl p-6' },
        React.createElement('h2', { className: 'text-xl font-bold text-red-400 mb-4' }, 'CRITICAL ATTENTION'),
        React.createElement('div', { className: 'space-y-3' },
          criticalEmployees.length > 0 ? 
            criticalEmployees.map((employee, index) => 
              React.createElement('div', { 
                key: index, 
                className: 'bg-red-500/20 rounded-lg p-3 flex justify-between items-center'
              },
                React.createElement('div', null,
                  React.createElement('div', { className: 'font-semibold' }, employee.name),
                  React.createElement('div', { className: 'text-sm text-red-200' }, employee.position)
                ),
                React.createElement('div', { className: 'text-red-400 font-bold' }, 
                  employee.daysUntilExpiry <= 0 ? 'EXPIRED' : 'MISSING'
                )
              )
            ) :
            React.createElement('div', { className: 'text-center text-green-300 py-4' }, 'No critical issues!')
        )
      ),

      // Warning Section  
      React.createElement('div', { className: 'bg-white/10 backdrop-blur-sm rounded-xl p-6' },
        React.createElement('h2', { className: 'text-xl font-bold text-yellow-400 mb-4' }, 'EXPIRING SOON'),
        React.createElement('div', { className: 'space-y-3' },
          warningEmployees.length > 0 ? 
            warningEmployees.map((employee, index) => 
              React.createElement('div', { 
                key: index, 
                className: 'bg-yellow-500/20 rounded-lg p-3 flex justify-between items-center'
              },
                React.createElement('div', null,
                  React.createElement('div', { className: 'font-semibold' }, employee.name),
                  React.createElement('div', { className: 'text-sm text-yellow-200' }, employee.position)
                ),
                React.createElement('div', { className: 'text-yellow-400 font-bold' }, `${employee.daysUntilExpiry} DAYS`)
              )
            ) :
            React.createElement('div', { className: 'text-center text-green-300 py-4' }, 'No upcoming expirations!')
        )
      )
    )
  );
};

// Franchise Dashboard Component  
const FranchiseDashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [franchiseData, setFranchiseData] = useState({});

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    loadFranchiseData();
  }, []);

  const loadFranchiseData = async () => {
    try {
      setLoading(true);
      // Load franchise dashboard data from CertPercent file
      setFranchiseData({
        totalStores: 8,
        totalEmployees: 160,
        overallCompliance: 94,
        criticalStores: 2,
        warningStores: 3
      });
      setLoading(false);
    } catch (error) {
      console.error('Error loading franchise data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return React.createElement('div', {
      className: 'min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white flex items-center justify-center'
    }, 
      React.createElement('div', { className: 'text-center' },
        React.createElement('div', { className: 'text-3xl font-bold mb-4' }, 'Loading Franchise Dashboard...'),
        React.createElement('div', { className: 'text-blue-200' }, 'Processing company-wide data...')
      )
    );
  }

  return React.createElement('div', {
    className: 'min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white p-4'
  },
    // Header
    React.createElement('div', { className: 'mb-6' },
      React.createElement('div', { className: 'flex items-center justify-between' },
        React.createElement('div', { className: 'flex items-center space-x-4' },
          React.createElement('div', { className: 'bg-white rounded-lg p-3' },
            React.createElement('div', { className: 'text-blue-800 font-bold text-lg' }, 'JLU')
          ),
          React.createElement('div', null,
            React.createElement('h1', { className: 'text-3xl font-bold' }, 'Franchise-Wide Dashboard'),
            React.createElement('p', { className: 'text-blue-200' }, 'All Stores Overview')
          )
        ),
        React.createElement('div', { className: 'text-right' },
          React.createElement('div', { className: 'text-xl font-mono' }, currentTime.toLocaleTimeString()),
          React.createElement('div', { className: 'text-blue-200' }, currentTime.toLocaleDateString())
        )
      )
    ),

    // Navigation
    React.createElement('div', { className: 'mb-4' },
      React.createElement(Link, {
        to: '/store/609',
        className: 'px-3 py-1 rounded text-sm bg-white/20 hover:bg-white/30'
      }, 'View Individual Stores')
    ),

    // Franchise Metrics
    React.createElement('div', { className: 'grid grid-cols-5 gap-4 mb-6' },
      React.createElement('div', { className: 'bg-white/10 backdrop-blur-sm rounded-xl p-4' },
        React.createElement('div', { className: 'text-2xl font-bold' }, franchiseData.totalStores),
        React.createElement('div', { className: 'text-sm text-white/70' }, 'Total Stores')
      ),
      React.createElement('div', { className: 'bg-white/10 backdrop-blur-sm rounded-xl p-4' },
        React.createElement('div', { className: 'text-2xl font-bold' }, franchiseData.totalEmployees),
        React.createElement('div', { className: 'text-sm text-white/70' }, 'Total Employees')
      ),
      React.createElement('div', { className: 'bg-white/10 backdrop-blur-sm rounded-xl p-4' },
        React.createElement('div', { className: 'text-2xl font-bold text-green-400' }, `${franchiseData.overallCompliance}%`),
        React.createElement('div', { className: 'text-sm text-white/70' }, 'Overall Compliance')
      ),
      React.createElement('div', { className: 'bg-white/10 backdrop-blur-sm rounded-xl p-4' },
        React.createElement('div', { className: 'text-2xl font-bold text-red-400' }, franchiseData.criticalStores),
        React.createElement('div', { className: 'text-sm text-white/70' }, 'Critical Stores')
      ),
      React.createElement('div', { className: 'bg-white/10 backdrop-blur-sm rounded-xl p-4' },
        React.createElement('div', { className: 'text-2xl font-bold text-yellow-400' }, franchiseData.warningStores),
        React.createElement('div', { className: 'text-sm text-white/70' }, 'Warning Stores')
      )
    ),

    React.createElement('div', { className: 'text-center text-white/70' },
      'Franchise-wide certification analytics and store comparisons will be displayed here.'
    )
  );
};

// Main App with Router
const App = () => {
  return React.createElement(BrowserRouter, null,
    React.createElement(Routes, null,
      React.createElement(Route, { path: '/', element: React.createElement(Navigate, { to: '/store/609' }) }),
      React.createElement(Route, { path: '/store/:storeId', element: React.createElement(StoreDashboard) }),
      React.createElement(Route, { path: '/franchise', element: React.createElement(FranchiseDashboard) })
    )
  );
};

// Load React Router from CDN and render
const script = document.createElement('script');
script.src = 'https://unpkg.com/react-router-dom@6.15.0/dist/umd/react-router-dom.production.min.js';
script.onload = () => {
  ReactDOM.render(React.createElement(App), document.getElementById('root'));
};
document.head.appendChild(script);
