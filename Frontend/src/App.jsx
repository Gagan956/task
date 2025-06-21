import './App.css';
import TodoList from './component/TodoList';


function App() {
  return (
     <div className="min-h-screen bg-gradient-to-r bg-gray-900 text-white flex flex-col">
      {/* Navbar-style header */}
      <header className="w-full bg-white shadow py-4 px-6 text-center">
        <h1 className="text-2xl font-bold text-gray-800">
          📝 Airtable Todo Manager
        </h1>
      </header>

      {/* Centered content */}
      <main className="flex-grow flex justify-center items-start pt-12 px-4">
    <div className="w-full max-w-2xl">
      <TodoList />
    </div>
  </main>
    </div>
  );
}

export default App;
 