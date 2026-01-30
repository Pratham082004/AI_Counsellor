import React from 'react';
import { cn } from '../../lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Card: React.FC<CardProps> = ({ className, ...props }) => {
  return (
    <div
      className={cn(
        'rounded-lg border border-navy-200 bg-white p-6 shadow-sm',
        className
      )}
      {...props}
    />
  );
};

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export const CardHeader: React.FC<CardHeaderProps> = ({ className, ...props }) => {
  return (
    <div
      className={cn('mb-4 border-b border-navy-200 pb-4', className)}
      {...props}
    />
  );
};

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

export const CardTitle: React.FC<CardTitleProps> = ({ className, ...props }) => {
  return (
    <h3
      className={cn('text-2xl font-semibold text-navy-900', className)}
      {...props}
    />
  );
};

interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

export const CardDescription: React.FC<CardDescriptionProps> = ({
  className,
  ...props
}) => {
  return <p className={cn('text-sm text-navy-600', className)} {...props} />;
};

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export const CardContent: React.FC<CardContentProps> = ({
  className,
  ...props
}) => {
  return <div className={cn('', className)} {...props} />;
};

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export const CardFooter: React.FC<CardFooterProps> = ({
  className,
  ...props
}) => {
  return (
    <div
      className={cn('flex justify-end gap-3 border-t border-navy-200 pt-4', className)}
      {...props}
    />
  );
};

