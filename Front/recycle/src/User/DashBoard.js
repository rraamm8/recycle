import 'charts.css';

export default function DashBoard() {
  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* git test */}
      
    {/* Header */}
    <header className="w-full  h-10 bg-[#1c4227] ">헤더</header>

    <div className="flex flex-1">
      {/* Sidebar */}
      <aside className="w-1/4 bg-[#a2b9a8] text-white p-4">
        <h1 className="text-lg sm:text-3xl font-bold mb-6">DASHBOARD</h1>
        <div className="flex grid grid-cols-1 lg:grid-cols-2 gap-6">
          <button className="w-full py-2 bg-[#6d7a71] hover:bg-[#435348] rounded-md">
            메뉴 1
          </button>
          <button className="w-full py-2 bg-[#6d7a71] hover:bg-[#435348] rounded-md">
            메뉴 2
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">
        {/* Search and Header */}
        <div className="flex items-center justify-between mb-6">
          <input
            type="text"
            placeholder="Search"
            className="w-1/3 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-green-300"
          />
          {/* <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-500">
            검색
          </button> */}
        </div>

        {/* Graph and Table */}
        <div className=" flex flex-col gap-6">
          {/* Graph Section */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">Graph</h2>
            <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
              {/* Graph Placeholder */}
              <span className="text-gray-500">그래프 영역</span>
            </div>
          </div>

          {/* Table Section */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">Table</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-2">헤더 1</th>
                    <th className="border p-2">헤더 2</th>
                    <th className="border p-2">헤더 3</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border p-2">데이터 1</td>
                    <td className="border p-2">데이터 2</td>
                    <td className="border p-2">데이터 3</td>
                  </tr>
                  <tr>
                    <td className="border p-2">데이터 4</td>
                    <td className="border p-2">데이터 5</td>
                    <td className="border p-2">데이터 6</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
  )
}
