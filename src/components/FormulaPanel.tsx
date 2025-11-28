import React from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath } from 'react-katex';

interface FormulaRowProps {
  formula: string | string[];
  value: number;
  comparisonValue?: number | null;
  precision?: number;
}

const FormulaRow: React.FC<FormulaRowProps> = ({ formula, value, comparisonValue, precision = 4 }) => {
  const isMultiLine = Array.isArray(formula);
  const hasComparison = comparisonValue !== undefined && comparisonValue !== null;
  
  // For multi-line formulas, stack values vertically
  if (isMultiLine) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        padding: '6px 12px',
        borderBottom: '1px solid var(--border-color)',
        gap: '12px',
      }}>
        <div style={{ flex: 1, fontSize: '14px', whiteSpace: 'nowrap' }}>
          {formula.map((line, idx) => (
            <div key={idx} style={{ paddingLeft: idx > 0 ? '20px' : 0, marginBottom: idx < formula.length - 1 ? '2px' : 0 }}>
              <InlineMath math={line} />
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flexShrink: 0, alignItems: 'flex-end' }}>
          <div style={{
            minWidth: '80px',
            padding: '4px 10px',
            backgroundColor: '#f5f5f5',
            borderRadius: '4px',
            fontFamily: 'monospace',
            fontSize: '13px',
            textAlign: 'right',
          }}>
            {isNaN(value) || !isFinite(value) ? '—' : value.toFixed(precision)}
          </div>
          {hasComparison && (
            <div style={{
              minWidth: '80px',
              padding: '4px 10px',
              backgroundColor: '#fee',
              border: '1px solid #e88',
              borderRadius: '4px',
              fontFamily: 'monospace',
              fontSize: '13px',
              textAlign: 'right',
              color: '#c00',
            }}>
              {isNaN(comparisonValue) || !isFinite(comparisonValue) ? '—' : comparisonValue.toFixed(precision)}
            </div>
          )}
        </div>
      </div>
    );
  }
  
  // For single-line formulas, display values side by side
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '6px 12px',
      borderBottom: '1px solid var(--border-color)',
      gap: '12px',
    }}>
      <div style={{ flex: 1, fontSize: '14px', whiteSpace: 'nowrap' }}>
        <InlineMath math={formula} />
      </div>
      <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
        {hasComparison && (
          <div style={{
            minWidth: '80px',
            padding: '4px 10px',
            backgroundColor: '#fee',
            border: '1px solid #e88',
            borderRadius: '4px',
            fontFamily: 'monospace',
            fontSize: '13px',
            textAlign: 'right',
            color: '#c00',
          }}>
            {isNaN(comparisonValue) || !isFinite(comparisonValue) ? '—' : comparisonValue.toFixed(precision)}
          </div>
        )}
        <div style={{
          minWidth: '80px',
          padding: '4px 10px',
          backgroundColor: '#f5f5f5',
          borderRadius: '4px',
          fontFamily: 'monospace',
          fontSize: '13px',
          textAlign: 'right',
        }}>
          {isNaN(value) || !isFinite(value) ? '—' : value.toFixed(precision)}
        </div>
      </div>
    </div>
  );
};

interface FormulaConfig {
  formula: string | string[];
  value: number;
  comparisonValue?: number | null;
  precision?: number;
}

interface FormulaPanelProps {
  title: string;
  titleFormula?: string;
  formulas: FormulaConfig[];
}

export const FormulaPanel: React.FC<FormulaPanelProps> = ({
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
          comparisonValue={f.comparisonValue}
          precision={f. precision ??  4} 
        />
      ))}
    </div>
  </div>
);