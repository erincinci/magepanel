//
//  OKUtils.h
//  OkudaKit
//
//  Created by Todd Ditchendorf on 6/28/13.
//
//

#import <Cocoa/Cocoa.h>

#define OKFloorAlign(x) (floor((x)) + 0.5)
#define OKCeilAlign(x) (ceil((x)) - 0.5)
#define OKNoop(x) ((x))

extern NSString *const OKFontFace;
extern NSString *const OKBold;
extern NSString *const OKItalic;
extern NSString *const OKUnderline;

NSColor *OKHexColor(NSUInteger x);
NSColor *OKHexaColor(NSUInteger x);
NSColor *OKOppositeColor(NSColor *inColor);

NSGradient *OKVertGradient(NSUInteger topHex, NSUInteger botHex);
NSGradient *OKVertaGradient(NSUInteger topHex, NSUInteger botHex);

CGRect OKRectOutset(CGRect r, CGFloat x, CGFloat y);
void OKAddRoundRect(CGContextRef ctx, CGRect rect, CGFloat radius);

CGPoint OKAlignPointToDeviceSpace(CGContextRef ctx, CGPoint p);
CGSize OKAlignSizeToDeviceSpace(CGContextRef ctx, CGSize size);
CGRect OKAlignRectToDeviceSpace(CGContextRef ctx, CGRect r);

CGPoint OKAlignPointToUserSpace(CGContextRef ctx, CGPoint p);

NSUInteger OKLineNumberForGlyphAtIndex(NSString *str, NSUInteger searchGlyphIdx);
NSString *OKRevStr(NSString *inStr);

BOOL OKIsControlKeyPressed(NSEvent *evt);
BOOL OKIsCommandKeyPressed(NSEvent *evt);
BOOL OKIsOptionKeyPressed(NSEvent *evt);
BOOL OKIsShiftKeyPressed(NSEvent *evt);

void OKPerformOnMainThread(void (^block)(void));
void OKPerformOnBackgroundThread(void (^block)(void));
void OKPerformOnMainThreadAfterDelay(double delay, void (^block)(void));
void OKPerformOnBackgroundThreadAfterDelay(double delay, void (^block)(void));