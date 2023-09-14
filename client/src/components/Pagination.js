import React from "react";
import PropTypes from "prop-types";

export const PaginationButton = ({ n, setPage }) =>
  n >= 0 && (
    // eslint-disable-next-line
    <a href="#" onClick={(e) => setPage(n, e)}>
      {n + 1}
    </a>
  );

export const Pagination = ({ page, pages, setPage }) => (
  <p className="pagination">
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
  </p>
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
