import React from "react";

export const PaginationButton = ({ n, setPage }) =>
  n > 0 ? (
    // eslint-disable-next-line
    <a href="#" onClick={(e) => setPage(n, e)}>
      {n}
    </a>
  ) : (
    // eslint-disable-next-line
    <a href="#" onClick={(e) => e.preventDefault()}>
      {" "}
    </a>
  );

export const Pagination = ({ page, setPage }) => (
  <p className="pagination">
    {page >= 5 ? (
      <div>
        <PaginationButton n={Math.max(page - 10, 1)} setPage={setPage} />
        <span>...</span>
      </div>
    ) : null}
    <PaginationButton n={page - 3} setPage={setPage} />
    <PaginationButton n={page - 2} setPage={setPage} />
    <PaginationButton n={page - 1} setPage={setPage} />
    <span>{page}</span>
    <PaginationButton n={page + 1} setPage={setPage} />
    <PaginationButton n={page + 2} setPage={setPage} />
    <PaginationButton n={page + 3} setPage={setPage} />
    <span>...</span>
    <PaginationButton n={page + 10} setPage={setPage} />
  </p>
);
