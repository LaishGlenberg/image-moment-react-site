import React from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath } from 'react-katex';

interface FormulaRowProps {
  formula: string | string[];
  value: number;
  precision?: number;
}

const FormulaRow: React.FC<FormulaRowProps> = ({ formula, value, precision = 4 }) => {
  const isMultiLine = Array.isArray(formula);
  
  return (
    <div style={{
      display: 'flex',
      alignItems: isMultiLine ? 'flex-start' : 'center',
      justifyContent: 'space-between',
      padding: '6px 12px',
      borderBottom: '1px solid var(--border-color)',
      gap: '16px',
      flexDirection: isMultiLine ? 'column' : 'row'
    }}>
      <div style={{ flex: 1, fontSize: '14px', whiteSpace: 'nowrap' }}>
        {isMultiLine ? (
          formula.map((line, idx) => (
            <div key={idx} style={{ paddingLeft: idx > 0 ? '20px' : 0, marginBottom: idx < formula.length - 1 ?  '2px' : 0 }}>
              <InlineMath math={line} />
            </div>
          ))
        ) : (
          <InlineMath math={formula} />
        )}
      </div>
      <div style={{
        minWidth: '80px',
        padding: '4px 10px',
        backgroundColor: '#f5f5f5',
        borderRadius: '4px',
        fontFamily: 'monospace',
        fontSize: '13px',
        textAlign: 'right',
        flexShrink: 0,
        alignSelf: isMultiLine ? 'flex-start' : 'center'
      }}>
        {isNaN(value) || !isFinite(value) ? '—' : value.toFixed(precision)}
      </div>
    </div>
  );
};

interface FormulaPanelProps {
  title: string;
  titleFormula?: string;
  formulas: Array<{ formula: string | string[]; value: number; precision?: number }>;
}

export const FormulaPanel: React. FC<FormulaPanelProps> = ({
  title,
  titleFormula,
  formulas,
}) => (
  <div style={{
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    backgroundColor: 'var(--panel-bg)',
    overflow: 'hidden'
  }}>
    <div style={{
      padding: '10px 14px',
      borderBottom: '1px solid var(--border-color)',
      backgroundColor: '#fff',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      flexWrap: 'wrap'
    }}>
      <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600 }}>{title}</h3>
      {titleFormula && (
        <span style={{ color: '#666', fontSize: '12px' }}>
          <InlineMath math={titleFormula} />
        </span>
      )}
    </div>
    <div>
      {formulas.map((f, idx) => (
        <FormulaRow 
          key={idx} 
          formula={f.formula} 
          value={f.value} 
          precision={f.precision ??  4} 
        />
      ))}
    </div>
  </div>
);