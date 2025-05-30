import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useDispatch, useSelector } from "react-redux";
import { fetchApplicants } from "../../redux/slice/TalentSlice";

const Analytics = () => {
  const dispatch = useDispatch();

  const { applicants, loading, error } = useSelector(
    (state) => state.applicants
  );

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (token) {
      dispatch(fetchApplicants(token));
    }
  }, [dispatch, token]);

  const [applications] = useState([
    { name: "Frontend Developer", count: 3 },
    { name: "UI Developer", count: 3 },
    { name: "Backend Developer", count: 2 },
    { name: "Full Stack Developer", count: 1 },
  ]);

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  return (
    <div className="p-4 bg-white">
      <h2 className="text-sm font-semibold text-[#575757]">
        Application Analytics
      </h2>

      <div className="grid font-medium text-[#575757] grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8 mt-4">
        <div className="bg-zinc-100 px-4 pt-10 pb-12 rounded-md  text-center">
          <p className="text-4xl font-bold">
            {applicants?.length > 0 ? applicants.length : "0"}
          </p>
          <h3 className=" text-[14px] mt-2">Total Applications</h3>
        </div>
        {/* <div className="bg-zinc-100 p-4 rounded-md  text-center px-4 pt-10 pb-12">
                    <p className="text-4xl font-bold">{"0"}</p>
                    <h3 className=" text-[14px] mt-2">Pending Applications</h3>

                </div>
                <div className="bg-zinc-100 p-4 rounded-md  text-center px-4 pt-10 pb-12">
                    <p className="text-4xl font-bold">{"0"}</p>
                    <h3 className=" text-[14px] mt-2">Shortlisted Candidates</h3>

                </div>
                <div className="bg-zinc-100 p-4 rounded-md  text-center px-4 pt-10 pb-12">
                    <p className="text-4xl font-bold">{"0"}</p>
                    <h3 className=" text-[14px] mt-2">Hired Candidates</h3>

                </div> */}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Job Role Distribution */}
        <div className="bg-white rounded-md">
          <h3 className="text-[#575757] font-medium text-[14px] mb-2">
            Job Role Distribution
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={applications}>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#0088FE" barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Application Status Breakdown */}
        <div className="bg-white rounded-md">
          <h3 className="text-[#575757] text-[14px] mb-2 font-medium">
            Application Status Breakdown
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={applications}
                dataKey="count"
                nameKey="name"
                outerRadius={80}
                label
              >
                {applications.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
