# Archive: Preview Systems

This directory contains archived preview system implementations that have been superseded by newer, more robust solutions.

## Legacy Component-Based Preview System

**Path**: `legacy-component-based-preview/`  
**Status**: ❌ Archived (Superseded)  
**Technology**: Custom HTML templates with placeholder replacement  

### Why Archived:
- Template-based approach was less flexible than React
- `{{PLACEHOLDER}}` substitution was brittle 
- Limited to predefined component templates
- Superseded by React SSR system

## Current Production System

**Path**: `src/react_preview_system/`  
**Status**: ✅ Production Ready  
**Technology**: React + ShadCN UI + ESBuild + SSR  

### Advantages:
- Real React components with full TypeScript support
- Industry-standard ESBuild compilation
- ShadCN UI component library integration
- Reliable SSR with proper error handling
- Successfully tested with leonardo-todo component

## Migration Notes

The React SSR system provides all functionality of the legacy system plus:
- Better maintainability (leverages React ecosystem)
- More reliable compilation (ESBuild vs regex)
- Richer component library (ShadCN UI)
- Production-grade architecture

**Recommendation**: Use `src/react_preview_system/` for all new preview generation.