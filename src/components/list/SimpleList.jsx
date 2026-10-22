import React from "react";
import SortIcon from "../../assets/icons/Sort";
import CustomDropdown from "../CustomDropdown";
import DeleteIcon from "../../assets/icons/Delete";
import EditIcon from "../../assets/icons/Edit";
import InfoIcon from "../../assets/icons/Info";
import Paginator from "../Paginator";

const List = ({
  columns,
  data,
  startIndex = 0,
  totalCount,
  enableEdit = false,
  enableView = false,
  enableDelete = false,
  handleEdit,
  handleView,
  handleDelete,
}) => {
  return (
    <div className="w-full rounded-lg shadow-md overflow-auto text-[14px]">
      {/* Header */}
      <div className="bg-[#EEF2F6] px-4 py-3 flex items-center">
        <div className="flex-1 flex items-center gap-4 font-semibold text-gray-700">
          <span>{totalCount !== undefined ? (totalCount === 0 ? '0' : `${startIndex + 1}-${startIndex + data.length}`) : (data.length===0?'0':`1-${data.length}`)}</span>
        </div>
        {columns.map((col) => (
          <div
            key={col.key}
            className="flex-1 flex items-center gap-4 font-semibold text-gray-700">
            <SortIcon />
            <span className="">{col.label}</span>
          </div>
        ))}
        {(enableEdit || enableView || enableDelete) && (
          <div className="flex-1 flex justify-end items-center gap-4 font-semibold text-gray-700">
            Düzəliş
          </div>
        )}
      </div>
      {/* List */}
      <div className="divide-y divide-gray-200">
        {data.map((item, index) => (
          <div key={index} className="px-4 py-2.5 flex items-center hover:bg-gray-50 transition-colors">
            <div className="flex-1 px-2">{startIndex + index + 1}</div>
            {columns.map((col) => (
              <div key={col.key} className="flex-1 px-2">
                {item[col.key]}
              </div>
            ))}
            {(enableEdit || enableView || enableDelete) && (
              <div className="flex flex-1 justify-end px-2 gap-2">
                {enableView && (
                  <button
                    type="button"
                    onClick={() => handleView?.(item.id)}
                    className="text-[#155EEF] hover:text-[#155EEF]">
                    <InfoIcon />
                  </button>
                )}
                {enableEdit && (
                  <button
                    type="button"
                    onClick={() => handleEdit?.(item.id)}
                    className="text-yellow-600 hover:text-yellow-800">
                    <EditIcon />
                  </button>
                )}
                {enableDelete && (
                  <button
                    type="button"
                    onClick={() => handleDelete?.(item.id)}
                    className="text-red-600 hover:text-red-800">
                    <DeleteIcon />
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const SimpleList = ({
  columns,
  data,
  startIndex = 0,
  totalCount,
  startPage,
  endPage,
  currentPage,
  onPageChange,
  enableEdit = false,
  enableView = false,
  enableDelete = false,
  handleEdit,
  handleView,
  handleDelete,
}) => {
  return (
    <div className="flex flex-col gap-3 w-full">
      <List
        columns={columns}
        data={data}
        startIndex={startIndex}
        totalCount={totalCount}
        enableEdit={enableEdit}
        enableView={enableView}
        enableDelete={enableDelete}
        handleEdit={handleEdit}
        handleView={handleView}
        handleDelete={handleDelete}
      />
      {startPage && endPage && currentPage && onPageChange && (
        <Paginator
          startPage={startPage}
          endPage={endPage}
          currentPage={currentPage}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
};

export default SimpleList;
