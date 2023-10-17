import React from "react";
import PropTypes from "prop-types";

export const PaginationButton = ({ n, setPage }) =>
  n >= 0 && (
    // eslint-disable-next-line
    <p className="paginationNumber" onClick={(e) => setPage(n, e)}>
      <u>{n + 1}</u>
    </p>
  );

export const Pagination = ({ page, pages, setPage }) => (
  <div className="pagination">
    {page !== 0 && <PaginationButton n={0} setPage={setPage} />}
    {page > 4 && <span>...</span>}
    {page > 3 && <PaginationButton n={page - 3} setPage={setPage} />}
    {page > 2 && <PaginationButton n={page - 2} setPage={setPage} />}
    {page > 1 && <PaginationButton n={page - 1} setPage={setPage} />}
    <span>{page + 1}</span>
    {page < pages - 2 && <PaginationButton n={page + 1} setPage={setPage} />}
    {page < pages - 3 && <PaginationButton n={page + 2} setPage={setPage} />}
    {page < pages - 4 && <PaginationButton n={page + 3} setPage={setPage} />}
    {page < pages - 5 && <span>...</span>}
    {page < pages - 1 && <PaginationButton n={pages - 1} setPage={setPage} />}
  </div>
);

Pagination.propTypes = {
  page: PropTypes.number.isRequired,
  pages: PropTypes.number,
  setPage: PropTypes.func.isRequired,
};

PaginationButton.propTypes = {
  n: PropTypes.number.isRequired,
  setPage: PropTypes.func.isRequired,
};
