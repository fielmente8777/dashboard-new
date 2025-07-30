import React from "react";
import { useState } from "react";

const QuickResponsePopup = ({ open, setOpen }) => {
  const [currentTab, setCurrentTab] = useState(0);
  const [templateSelected, setTemplateSelected] = useState(0);

  const [selectedVia, setSelectedVia] = useState(0);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center">
      <div className="max-w-4xl w-full mx-auto  bg-white flex rounded-sm">
        <div className="w-64 bg-gray-200 p-4 space-y-5">
          <div className="">
            <h2 className="text-lg font-semibold">Send Quick Response to</h2>
            <h3>Hem Bhadur</h3>
          </div>

          <div className="space-y-3">
            <p>Sending Via</p>

            <div className="space-y-4">
              <div
                onClick={() => setSelectedVia(0)}
                className={`flex justify-between items-center rounded-full ${
                  selectedVia === 0 ? "bg-primary text-white" : "bg-white"
                } border-2 border-primary/75 px-4 py-2`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span>Icon</span>
                    <p>What's App</p>
                  </div>

                  <p>+91 0000000000</p>
                </div>

                <div>
                  <input type="radio" name="" id="" />
                </div>
              </div>

              <div
                className={`flex justify-between items-center rounded-full ${
                  selectedVia === 1 ? "bg-primary text-white" : "bg-white"
                } border-2 border-primary/75 px-4 py-2`}
                onClick={() => setSelectedVia(1)}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span>Icon</span>
                    <p>What's App</p>
                  </div>

                  <p>+91 0000000000</p>
                </div>

                <div>
                  <input type="radio" name="" id="" />
                </div>
              </div>

              <div
                className={`flex justify-between items-center rounded-full ${
                  selectedVia === 2 ? "bg-primary text-white" : "bg-white"
                } border-2 border-primary/75 px-4 py-2`}
                onClick={() => setSelectedVia(2)}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span>Icon</span>
                    <p>What's App</p>
                  </div>

                  <p>+91 0000000000</p>
                </div>

                <div>
                  <input type="radio" name="" id="" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 p-4">
          {selectedVia ? (
            <div className="flex flex-col gap-5">
              <div>
                <h2>Exampple 1 : First Message to new Lead</h2>
              </div>

              <div className="flex-1">
                <textarea
                  name=""
                  id=""
                  className="w-full h-full border"
                  rows={12}
                />
              </div>

              <div>
                <button className="w-full text-center bg-green-500 text-white py-3">
                  Send Whats'app
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div>Tabs</div>

              <div className="space-y-8">
                <div className="flex">
                  <div className="flex-1">
                    <h2>Exampple 1 : First Message to new Lead</h2>
                    <p className="text-sm">
                      Lorem ipsum dolor sit amet consectetur, adipisicing elit
                    </p>
                  </div>

                  <div>
                    <button
                      className="bg-blue-300 text-white px-6 py-2"
                      onClick={() => setSelectedVia("1")}
                    >
                      Select
                    </button>
                  </div>
                </div>

                <div className="flex">
                  <div className="flex-1">
                    <h2>Exampple 1 : First Message to new Lead</h2>
                    <p className="text-sm">
                      Lorem ipsum dolor sit amet consectetur, adipisicing elit
                    </p>
                  </div>

                  <div>
                    <button className="bg-blue-300 text-white px-6 py-2">
                      Select
                    </button>
                  </div>
                </div>

                <div className="flex">
                  <div className="flex-1">
                    <h2>Exampple 1 : First Message to new Lead</h2>
                    <p className="text-sm">
                      Lorem ipsum dolor sit amet consectetur, adipisicing elit
                    </p>
                  </div>

                  <div>
                    <button className="bg-blue-300 text-white px-6 py-2">
                      Select
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuickResponsePopup;
