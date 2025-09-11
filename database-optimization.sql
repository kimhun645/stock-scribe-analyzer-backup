-- Database Performance Optimization Scripts
-- Stock Scribe Analyzer - Performance Enhancement

-- 1. Create Indexes for Better Performance
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_movements_product ON movements(product_id);
CREATE INDEX IF NOT EXISTS idx_movements_date ON movements(created_at);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);

-- 2. Create Composite Indexes
CREATE INDEX IF NOT EXISTS idx_movements_product_date ON movements(product_id, created_at);
CREATE INDEX IF NOT EXISTS idx_products_category_name ON products(category_id, name);

-- 3. Analyze Tables for Query Optimization
ANALYZE products;
ANALYZE movements;
ANALYZE categories;
ANALYZE users;

-- 4. Create Views for Common Queries
CREATE OR REPLACE VIEW product_stock_summary AS
SELECT 
    p.id,
    p.name,
    p.description,
    p.unit_price,
    c.name as category_name,
    COALESCE(SUM(
        CASE 
            WHEN sm.type = 'in' THEN sm.quantity
            WHEN sm.type = 'out' THEN -sm.quantity
            ELSE 0
        END
    ), 0) as current_stock
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN movements sm ON p.id = sm.product_id
GROUP BY p.id, p.name, p.description, p.unit_price, c.name;

-- 5. Create Function for Stock Calculation
CREATE OR REPLACE FUNCTION calculate_product_stock(product_id_param INTEGER)
RETURNS INTEGER AS $$
DECLARE
    stock_count INTEGER;
BEGIN
    SELECT COALESCE(SUM(
        CASE 
            WHEN type = 'in' THEN quantity
            WHEN type = 'out' THEN -quantity
            ELSE 0
        END
    ), 0) INTO stock_count
    FROM movements
    WHERE product_id = product_id_param;
    
    RETURN stock_count;
END;
$$ LANGUAGE plpgsql;

-- 6. Create Trigger for Automatic Stock Updates
CREATE OR REPLACE FUNCTION update_product_stock()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE products 
    SET current_stock = calculate_product_stock(NEW.product_id)
    WHERE id = NEW.product_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_stock
    AFTER INSERT OR UPDATE OR DELETE ON movements
    FOR EACH ROW
    EXECUTE FUNCTION update_product_stock();
