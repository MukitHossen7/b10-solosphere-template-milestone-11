/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import JobCard from "../components/JobCard";
import axios from "axios";

const AllJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [filter, setFilter] = useState("");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("");
  const [jobCount, setJobCount] = useState(0);
  const [pageCard, setPageCard] = useState(5);
  const pageCount = Math.ceil(jobCount / pageCard);
  const pages = [...Array(pageCount).keys()];
  const [currentPage, setCurrentPage] = useState(0);
  useEffect(() => {
    const fetchAllJobsData = async () => {
      const { data } = await axios.get(
        `${
          import.meta.env.VITE_API_URL
        }/all_jobs?filter=${filter}&search=${search}&sort=${sort}`
      );
      setJobs(data);
    };
    fetchAllJobsData();
  }, [filter, search, sort]);
  useEffect(() => {
    const fetchAllJobsCount = async () => {
      const { data } = await axios.get(
        `${
          import.meta.env.VITE_API_URL
        }/all_jobs_count?page=${currentPage}&size=${pageCard}`
      );
      setJobCount(data.count);
    };
    fetchAllJobsCount();
  }, [currentPage, pageCard]);

  const handleReset = () => {
    setFilter("");
    setSearch("");
    setSort("");
  };
  const handleSetValue = (e) => {
    const item = parseInt(e.target.value);
    setPageCard(item);
    setCurrentPage(0);
  };
  console.log(currentPage);
  return (
    <div className="container px-6 py-10 mx-auto min-h-[calc(100vh-306px)] flex flex-col justify-between">
      <div>
        <div className="flex flex-col md:flex-row justify-center items-center gap-5 ">
          <div>
            <select
              name="category"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              id="category"
              className="border p-4 rounded-lg"
            >
              <option value="">Filter By Category</option>
              <option value="Web Development">Web Development</option>
              <option value="Graphics Design">Graphics Design</option>
              <option value="Digital Marketing">Digital Marketing</option>
            </select>
          </div>

          <form>
            <div className="flex p-1 overflow-hidden border rounded-lg    focus-within:ring focus-within:ring-opacity-40 focus-within:border-blue-400 focus-within:ring-blue-300">
              <input
                className="px-6 py-2 text-gray-700 placeholder-gray-500 bg-white outline-none focus:placeholder-transparent"
                type="text"
                name="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Enter Job Title"
                aria-label="Enter Job Title"
              />

              <button className="px-1 md:px-4 py-3 text-sm font-medium tracking-wider text-gray-100 uppercase transition-colors duration-300 transform bg-gray-700 rounded-md hover:bg-gray-600 focus:bg-gray-600 focus:outline-none">
                Search
              </button>
            </div>
          </form>
          <div>
            <select
              name="category"
              id="category"
              value={sort}
              className="border p-4 rounded-md"
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="">Sort By Deadline</option>
              <option value="dsc">Descending Order</option>
              <option value="asc">Ascending Order</option>
            </select>
          </div>
          <button onClick={handleReset} className="btn">
            Reset
          </button>
        </div>
        <div className="grid grid-cols-1 gap-8 mt-8 xl:mt-16 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {jobs.map((job) => (
            <JobCard key={job._id} job={job} />
          ))}
        </div>
      </div>
      <h2 className="mt-8">Current Page : {currentPage}</h2>
      <div className="mt-5 flex gap-3">
        {pages.map((page, idx) => (
          <button
            onClick={() => setCurrentPage(page)}
            className={`btn ${currentPage === page ? "bg-red-400" : ""}`}
            key={idx}
          >
            {page}
          </button>
        ))}
        <select
          value={pageCard}
          className="border-2 border-gray-500"
          onChange={handleSetValue}
        >
          <option value="3">3</option>
          <option value="5">5</option>
          <option value="7">7</option>
        </select>
      </div>
    </div>
  );
};

export default AllJobs;
