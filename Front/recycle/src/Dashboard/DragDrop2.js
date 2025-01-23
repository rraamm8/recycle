import React from "react";
import { Droppable } from "react-beautiful-dnd";
import Chart from "./Chart";

const DragDrop2 = ({ div2Items }) => {
  return (
    <Droppable droppableId="div2">
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className="w-1/2 p-4 bg-white rounded-lg shadow-md h-[500px] overflow-y-auto"
        >
          <h2 className="text-lg font-bold mb-4">div2: 데이터 조합 및 업로드</h2>
          {div2Items.map((item, index) => (
            <div key={item.id} className="p-4 mb-2 bg-green-200 rounded shadow">
              {item.content}
              <Chart />
            </div>
          ))}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
};

export default DragDrop2;
