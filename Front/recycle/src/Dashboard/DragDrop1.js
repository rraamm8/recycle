import React from "react";
import { Droppable, Draggable } from "react-beautiful-dnd";

const DragDrop1 = ({ div1Items }) => {
  return (
    <Droppable droppableId="div1">
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className="w-1/2 p-4 bg-white rounded-lg shadow-md h-[500px] overflow-y-auto"
        >
          <h2 className="text-lg font-bold mb-4">div1: 차트 및 테이블</h2>
          {div1Items.map((item, index) => (
            <Draggable key={item.id} draggableId={item.id} index={index}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                  className="p-4 mb-2 bg-gray-200 rounded shadow cursor-pointer"
                >
                  {item.content}
                </div>
              )}
            </Draggable>
          ))}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
};

export default DragDrop1;
