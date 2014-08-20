//  Copyright 2010 Todd Ditchendorf
//
//  Licensed under the Apache License, Version 2.0 (the "License");
//  you may not use this file except in compliance with the License.
//  You may obtain a copy of the License at
//
//  http://www.apache.org/licenses/LICENSE-2.0
//
//  Unless required by applicable law or agreed to in writing, software
//  distributed under the License is distributed on an "AS IS" BASIS,
//  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//  See the License for the specific language governing permissions and
//  limitations under the License.

#import <Cocoa/Cocoa.h>

#define TDRoundAlign(x) (round((x)) + 0.5)
#define TDFloorAlign(x) (floor((x)) + 0.5)
#define TDCeilAlign(x) (ceil((x)) + 0.5)
#define TDNoop(x) (x)

#define TD_BIG_FLOAT 1000000.0

NSGradient *TDVertGradient(NSUInteger topHex, NSUInteger botHex);
NSColor *TDHexColor(NSUInteger x);
NSColor *TDHexaColor(NSUInteger x);
id TDCGHexColor(NSUInteger x);
id TDCGHexaColor(NSUInteger x);
NSString *TDHexStringFromColor(NSColor *c);

void TDPerformOnMainThread(void (^block)(void));
void TDPerformOnBackgroundThread(void (^block)(void));
void TDPerformOnMainThreadAfterDelay(double delay, void (^block)(void));
void TDPerformOnBackgroundThreadAfterDelay(double delay, void (^block)(void));

CGRect TDRectOutset(CGRect r, CGFloat dx, CGFloat dy);
NSRect TDNSRectOutset(NSRect r, CGFloat dx, CGFloat dy);
NSBezierPath *TDGetRoundRect(NSRect r, CGFloat radius, CGFloat lineWidth);
NSBezierPath *TDDrawRoundRect(NSRect r, CGFloat radius, CGFloat lineWidth, NSGradient *fillGradient, NSColor *strokeColor);
void TDAddRoundRect(CGContextRef ctx, CGRect rect, CGFloat radius);

BOOL TDIsCommandKeyPressed(NSInteger modifierFlags);
BOOL TDIsControlKeyPressed(NSInteger modifierFlags);
BOOL TDIsShiftKeyPressed(NSInteger modifierFlags);
BOOL TDIsOptionKeyPressed(NSInteger modifierFlags);

NSPoint TDAlignPointToDeviceSpace(CGContextRef ctx, NSPoint p);
CGPoint TDDeviceFloorAlign(CGContextRef ctx, CGPoint p);

NSNib *TDLoadNib(id owner, NSString *nibName, NSBundle *bundle);

BOOL TDIsMtnLionOrLater();
BOOL TDIsLionOrLater();
BOOL TDIsSnowLeopardOrLater();
void TDGetSystemVersion(NSUInteger *major, NSUInteger *minor, NSUInteger *bugfix);

NSStringEncoding TDNSStringEncodingFromTextEncodingName(NSString *encName);
NSString *TDTextEncodingNameFromNSStringEncoding(NSStringEncoding enc);

typedef struct {
    CGFloat top; 
    CGFloat left; 
    CGFloat bottom;
    CGFloat right;
} TDEdgeInsets;

TDEdgeInsets TDEdgeInsetsMake(CGFloat top, CGFloat left, CGFloat bottom, CGFloat right);

void TDDumpAppleEvent(NSAppleEventDescriptor *aevtDesc);