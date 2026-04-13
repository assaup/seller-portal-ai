import { useState } from "react";
import { useFetch } from "../../hooks/useFetch";
import { useDebounce } from "../../hooks/useDebounce";
import { itemsApi } from "../../api/items";
import AdCard from "../../components/AdCard/AdCard";
import Pagination from "../../components/Pagination/Pagination";
import type { Category, ItemsResponse } from "../../types";
import FilterToCards from "../../components/icons/FilterToCards";
import FilterToList from "../../components/icons/FilterToList";
import styles from "./AdsListPage.module.scss";

const LIMIT = 6;
const CATEGORIES: { value: Category; label: string }[] = [
  { value: "electronics", label: "Электроника" },
  { value: "auto", label: "Транспорт" },
  { value: "real_estate", label: "Недвижимость" },
];

const AdsListPage = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectCategories, setSelectCategories] = useState<Category[]>([]);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [sortColumn, setSortColumn] = useState<"title" | "createdAt">(
    "createdAt",
  );
  const [needsRevision, setNeedsRevision] = useState(false);

  const debouncedSearch = useDebounce(search, 400);

  const { data, loading, error } = useFetch<ItemsResponse>(
    (signal) =>
      itemsApi.getAll({
        signal,
        q: debouncedSearch,
        categories: selectCategories,
        needsRevision: needsRevision || undefined,
        sortColumn,
        sortDirection,
        limit: LIMIT,
        skip: (page - 1) * LIMIT,
      }),
    [
      debouncedSearch,
      selectCategories,
      needsRevision,
      sortColumn,
      sortDirection,
      page,
    ],
  );

  const toggelCategories = (cat: Category) => {
    setPage(1);
    setSelectCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
  };

  const resetFilters = () => {
    setPage(1);
    setSelectCategories([]);
    setNeedsRevision(false);
    setSearch("");
  };

  return (
    <div className={styles.loyuot}>
      <section>
        <h1 className={styles.title}>Мои объявления</h1>
        {data && <span className={styles.count}>{data.total} объявления</span>}
      </section>

      <section className={styles.adsList}>
        <div className={styles.filters}>
          <div className={styles.search}>
            <label className="visually-hidden" htmlFor="search">
              Поиск объявлений
            </label>
            <input
              id="search"
              type="text"
              className={styles.searchInput}
              placeholder="Найти объявление..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
            <svg
              className={styles.loupe}
              viewBox="0 0 14 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M5.43921 0.752045C6.6907 0.752045 7.8693 1.23924 8.75366 2.12509C9.63803 3.01102 10.1267 4.18643 10.1267 5.43954C10.1267 6.4864 9.78664 7.48194 9.15698 8.29599L13.2146 12.3536C13.2265 12.3655 13.2355 12.3801 13.2419 12.3956C13.2483 12.4111 13.2517 12.4277 13.2517 12.4444C13.2517 12.4612 13.2484 12.4778 13.2419 12.4933C13.2355 12.5088 13.2265 12.5234 13.2146 12.5352L12.533 13.2149C12.5212 13.2266 12.5072 13.2359 12.4919 13.2423C12.4764 13.2487 12.459 13.252 12.4421 13.252C12.4255 13.252 12.4087 13.2487 12.3933 13.2423C12.378 13.2359 12.3641 13.2266 12.3523 13.2149L8.2937 9.15829C7.47969 9.78628 6.48597 10.127 5.43921 10.127C4.18634 10.127 3.01001 9.63965 2.12573 8.754C1.24136 7.86962 0.751709 6.69111 0.751709 5.43954C0.751715 4.18643 1.2398 3.00946 2.12573 2.12509C3.01 1.24101 4.18792 0.752112 5.43921 0.752045ZM5.43921 1.93954C4.50493 1.93961 3.62704 2.30406 2.9646 2.96494C2.30374 3.62585 1.93922 4.50523 1.93921 5.43954C1.93921 6.37385 2.30375 7.25167 2.9646 7.91415C3.62704 8.57503 4.50493 8.93948 5.43921 8.93954C6.37358 8.93954 7.25229 8.57509 7.91479 7.91415C8.5755 7.25326 8.93921 6.37375 8.93921 5.43954C8.9392 4.50534 8.57551 3.62739 7.91479 2.96494C7.25386 2.30244 6.37358 1.93954 5.43921 1.93954Z"
                fill="black"
                fill-opacity="0.85"
              />
            </svg>
          </div>
          <div className={styles.btns}>
            <button className={styles.btn}>
              <FilterToCards />
            </button>
            <button className={styles.btn}>
              <FilterToList />
            </button>
          </div>
          <div className={styles.wrapper}>
            <select
              className={styles.select}
              value={`${sortColumn}_${sortDirection}`}
              onChange={(e) => {
                const [col, dir] = e.target.value.split("_");
                setSortColumn((col as "title") || "createdAt");
                setSortDirection((dir as "asc") || "desc");
                setPage(1);
              }}
            >
              <option value="createdAt_desc">По новизне (сначала новые)</option>
              <option value="createdAt_asc">По новизне (сначала старые)</option>
              <option value="title_asc">По названию (А - Я)</option>
              <option value="title_desc">По названию (Я - А)</option>
            </select>
          </div>
        </div>
        <div className={styles.content}>
          <aside className={styles.aside}>
            <div className={styles.aside__content}>
              <h2 className={styles.aside__title}>Фильтры</h2>
              <details className={styles.aside__details}>
                <summary className={styles.aside__summary}>Категория</summary>
                {CATEGORIES.map((cat) => (
                  <label key={cat.value} className={styles.aside__label}>
                    <input
                      type="checkbox"
                      checked={selectCategories.includes(cat.value)}
                      onChange={() => toggelCategories(cat.value)}
                    />
                    {cat.label}
                  </label>
                ))}
              </details>
              <div className={styles.aside__line}></div>
              <label className={styles.switch}>
                Только требующие доработок
                <input
                  className={styles.switch__input}
                  type="checkbox"
                  checked={needsRevision}
                  onChange={(e) => {
                    setNeedsRevision(e.target.checked);
                    setPage(1);
                  }}
                />
                <span className={styles.switch__slider}></span>
              </label>
            </div>
            <button className={styles.aside__resetBtn} onClick={resetFilters}>
              Сбросить фильтры
            </button>
          </aside>
          <div className={styles.ads}>
            {loading && <p className={styles.message}>Загрузка...</p>}
            {error && <p className={styles.error}>Ошибка: {error}</p>}

            {!loading && !error && data?.items.length === 0 && (
              <div className={styles.message}>
                <p className={styles.message__text}>Объявления не найдены</p>
              </div>
            )}

            {data && (
              <>
                <div className={styles.grid}>
                  {data.items.map((item) => (
                    <AdCard key={item.id} item={item} />
                  ))}
                </div>
                <Pagination
                  page={page}
                  total={data.total}
                  limit={LIMIT}
                  onChange={setPage}
                />
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdsListPage;
