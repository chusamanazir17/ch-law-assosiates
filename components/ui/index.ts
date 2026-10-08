/**
 * Shared UI primitives for the CH Law Associates platform.
 *
 * Buttons / forms:      Button, Input, Textarea, Select, FormField
 * Feedback:             Toast (ToastProvider + useToast)
 * Structure:            Modal, Card (+CardHeader/CardBody/CardFooter),
 *                       Table, Badge, EmptyState, Spinner/Skeleton/SkeletonRows
 *
 * Styling is driven by the design-system classes in app/globals.css
 * (.btn-primary, .btn-secondary, .btn-danger, .input-field, .form-label,
 * .card, .badge, .badge-*, .table, .table-wrap) — edit there, not here.
 */

export { Button, default as ButtonDefault } from './Button';
export type { ButtonProps, ButtonVariant, ButtonSize } from './Button';

export { Input } from './Input';
export type { InputProps } from './Input';

export { Textarea } from './Textarea';
export type { TextareaProps } from './Textarea';

export { Select } from './Select';
export type { SelectProps } from './Select';

export { FormField } from './FormField';
export type { FormFieldProps } from './FormField';

export { Modal } from './Modal';
export type { ModalProps, ModalSize } from './Modal';

export { Card, CardHeader, CardBody, CardFooter } from './Card';
export type { CardProps } from './Card';

export { Table } from './Table';
export type { TableProps, TableColumn } from './Table';

export { Badge } from './Badge';
export type { BadgeProps, BadgeVariant } from './Badge';

export { EmptyState } from './EmptyState';
export type { EmptyStateProps } from './EmptyState';

export { Spinner, Skeleton, SkeletonRows } from './Spinner';
export type { SpinnerProps, SpinnerSize, SkeletonProps, SkeletonRowsProps } from './Spinner';

export { ToastProvider, useToast } from './Toast';
export type { ToastOptions, ToastVariant } from './Toast';
